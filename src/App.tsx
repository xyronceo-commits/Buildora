import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { collection, collectionGroup, onSnapshot, doc, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { db, sanitizeForFirestore } from './lib/firebase';
import { useAuth } from './context/AuthContext';
import { useProject } from './context/ProjectContext';
import { useTheme } from './context/ThemeContext';
import { Listing, Business, UserRole, QuoteRequest, AvailabilityStatus } from './types';
import { INITIAL_LISTINGS, INITIAL_BUSINESSES } from './data/seedData';
import { Loader2 } from 'lucide-react';

// Layout & Global Components
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { ProjectSelectorModal } from './components/ProjectSelectorModal';
import { AuthModal } from './components/AuthModal';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { CompareDrawer } from './components/CompareDrawer';
import { Onboarding } from './components/Onboarding';
import { Splash } from './components/Splash';

// Views
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { ListingDetailView } from './views/ListingDetailView';
import { BusinessDetailView } from './views/BusinessDetailView';
import { SavedView } from './views/SavedView';
import { ProjectsView } from './views/ProjectsView';
import { ProfileView } from './views/ProfileView';
import { SupplierDashboardView } from './views/SupplierDashboardView';
import { AddListingView } from './views/AddListingView';
import { SupplierOnboardingView } from './views/SupplierOnboardingView';
import { ClientOnboardingView } from './views/ClientOnboardingView';

class ChunkErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
          <p className="text-sm font-bold text-red-500">Failed to load this section. Please check your network connection.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-5 py-2.5 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
          >
            Retry Loading
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function safeGetLocalStorage(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // ignore storage access error
  }
  return null;
}

function safeSetLocalStorage(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore storage access error
  }
}

const AdminDashboardView = lazy(() =>
  import('./views/AdminDashboardView').then((m) => ({ default: m.AdminDashboardView }))
);

export function App() {
  const { currentUser, isAdmin, loading, signOut } = useAuth();
  const { activeProject } = useProject();
  const { isDark } = useTheme();

  // App Initialization Flow
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  // Role and Onboarding State Management
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    if (currentUser?.role) return currentUser.role;
    const temp = safeGetLocalStorage('constrora_temp_role') as UserRole;
    return temp || 'client';
  });

  // A signed-out visitor sees the Get Started / onboarding screen first
  const [showRoleSelection, setShowRoleSelection] = useState(() => {
    if (currentUser) return false;
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('auth')) return false;
    }
    return true;
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (isAdmin) {
      return 'admin';
    }
    if (currentUser?.role === 'supplier') {
      return 'supplier';
    }
    return 'home';
  });

  const [subView, setSubView] = useState<'none' | 'detail' | 'business' | 'add_listing' | 'supplier_onboarding' | 'client_onboarding'>('none');

  // Selected Resources
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  // Search State
  const [searchCategory, setSearchCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('auth') === 'forgot' || p.get('auth') === 'signin' || p.get('auth') === 'signup';
    }
    return false;
  });
  const [authModalRole, setAuthModalRole] = useState<UserRole>('client');
  const [authModalIsSignUp, setAuthModalIsSignUp] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('auth') === 'forgot') return 'forgot';
      if (p.get('auth') === 'signup') return 'signup';
    }
    return 'signin';
  });
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);

  const openSignInModal = (role?: UserRole) => {
    setAuthModalRole(role || selectedRole);
    setAuthModalIsSignUp(false);
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const openSignUpModal = (role?: UserRole) => {
    setAuthModalRole(role || selectedRole);
    setAuthModalIsSignUp(true);
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const openForgotModal = (role?: UserRole) => {
    setAuthModalRole(role || selectedRole);
    setAuthModalIsSignUp(false);
    setAuthModalMode('forgot');
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get('auth');
    if (authParam === 'forgot') {
      openForgotModal();
    } else if (authParam === 'signin') {
      openSignInModal();
    }
  }, []);

  // Compared Items & Requests
  const [comparedListings, setComparedListings] = useState<Listing[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [businesses, setBusinesses] = useState<Business[]>(INITIAL_BUSINESSES);

  const handleAdminSignOut = async () => {
    await signOut();
    setShowRoleSelection(false);
    setActiveTab('home');
    setSubView('none');
    window.history.replaceState({}, '', '/');
  };

  // Admin Route Listener for /admin and #admin
  useEffect(() => {
    if (loading) return; // Wait for Firebase Auth state to resolve

    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const isAdminUrl = path.startsWith('/admin') || hash.startsWith('#admin');

      if (isAdminUrl) {
        if (isAdmin) {
          setActiveTab('admin');
          setShowRoleSelection(false);
        } else if (currentUser) {
          // Authenticated non-admin: Immediately redirect to normal portal, do not fetch admin data
          const normalTab = currentUser.role === 'supplier' ? 'supplier' : 'home';
          setActiveTab(normalTab);
          window.history.replaceState({}, '', '/');
        } else {
          // Unauthenticated: Redirect to Get Started / Home
          openSignInModal('admin');
          setActiveTab('home');
          window.history.replaceState({}, '', '/');
        }
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    return () => window.removeEventListener('popstate', checkAdminRoute);
  }, [isAdmin, currentUser, loading]);

  // Real-time Firestore Sync for Businesses
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'businesses'),
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Business);
        setBusinesses(list.length > 0 ? list : INITIAL_BUSINESSES);
      },
      (err) => console.warn('Businesses listener warning:', err)
    );
    return () => unsub();
  }, []);

  // Real-time Firestore Sync for Listings across all businesses
  useEffect(() => {
    const unsub = onSnapshot(
      collectionGroup(db, 'listings'),
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Listing);
        setListings(list.length > 0 ? list : INITIAL_LISTINGS);
      },
      (err) => console.warn('Listings listener warning:', err)
    );
    return () => unsub();
  }, []);

  // Real-time Firestore Sync for Quote Requests
  useEffect(() => {
    if (!currentUser) {
      setQuoteRequests([]);
      return;
    }

    if (isAdmin) {
      const unsub = onSnapshot(
        collection(db, 'quoteRequests'),
        (snap) => {
          const list = snap.docs.map((d) => ({ ...d.data(), quoteRequestId: d.id } as QuoteRequest));
          setQuoteRequests(list);
        },
        (err) => console.warn('Admin quote requests listener warning:', err)
      );
      return () => unsub();
    }

    const unsubs: (() => void)[] = [];
    const requestsMap = new Map<string, QuoteRequest>();

    const updateCombined = () => {
      const list = Array.from(requestsMap.values()).sort((a, b) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });
      setQuoteRequests(list);
    };

    // Client quote requests
    const clientQuery = query(collection(db, 'quoteRequests'), where('clientId', '==', currentUser.uid));
    unsubs.push(
      onSnapshot(clientQuery, (snap) => {
        snap.docs.forEach((d) => requestsMap.set(d.id, { ...d.data(), quoteRequestId: d.id } as QuoteRequest));
        updateCombined();
      }, (err) => console.warn('Client quote listener info:', err))
    );

    // Supplier owner quote requests
    const supplierOwnerQuery = query(collection(db, 'quoteRequests'), where('supplierOwnerId', '==', currentUser.uid));
    unsubs.push(
      onSnapshot(supplierOwnerQuery, (snap) => {
        snap.docs.forEach((d) => requestsMap.set(d.id, { ...d.data(), quoteRequestId: d.id } as QuoteRequest));
        updateCombined();
      }, (err) => console.warn('Supplier owner quote listener info:', err))
    );

    if (currentUser.businessId && currentUser.businessId !== 'biz_default') {
      const supplierBizQuery = query(collection(db, 'quoteRequests'), where('supplierBusinessId', '==', currentUser.businessId));
      unsubs.push(
        onSnapshot(supplierBizQuery, (snap) => {
          snap.docs.forEach((d) => requestsMap.set(d.id, { ...d.data(), quoteRequestId: d.id } as QuoteRequest));
          updateCombined();
        }, (err) => console.warn('Supplier biz quote listener info:', err))
      );
    }

    return () => unsubs.forEach((u) => u());
  }, [currentUser?.uid, currentUser?.businessId, isAdmin]);

  // Synchronize state on authentication change
  useEffect(() => {
    if (loading) return;

    if (currentUser) {
      if (currentUser.role) {
        setSelectedRole(currentUser.role);
      }
      setShowRoleSelection(false);
      setSubView('none');

      if (isAdmin) {
        setActiveTab('admin');
      } else if (currentUser.role === 'supplier') {
        setActiveTab('supplier');
      } else {
        setActiveTab('home');
      }
    } else {
      setSubView('none');
      setActiveTab('home');
      setShowRoleSelection(true);
    }
  }, [currentUser, isAdmin, loading]);

  // Track auth state transitions: signing out lands on Get Started / Onboarding
  const prevUserRef = React.useRef(currentUser);
  useEffect(() => {
    if (prevUserRef.current && !currentUser) {
      setShowRoleSelection(true);
      setActiveTab('home');
      setSubView('none');
      window.history.replaceState({}, '', '/');
    }
    prevUserRef.current = currentUser;
  }, [currentUser]);

  // Handlers
  const handleRoleSelectionComplete = (role: UserRole) => {
    safeSetLocalStorage('constrora_onboarding_done', 'true');
    safeSetLocalStorage('constrora_temp_role', role);
    setSelectedRole(role);
    setShowRoleSelection(false);

    if (role === 'supplier') {
      setSubView('supplier_onboarding');
    } else {
      setSubView('client_onboarding');
    }
  };

  const handleSupplierOnboardingFinished = (biz: Business) => {
    setBusinesses((prev) => [biz, ...prev]);
    setSelectedBusinessId(biz.businessId);
    setSubView('none');
    setActiveTab('supplier');
  };

  const handleClientOnboardingFinished = () => {
    setSubView('none');
    setActiveTab('home');
  };

  const handleSelectListing = (listing: Listing) => {
    setSelectedListing(listing);
    setSubView('detail');
  };

  const handleSelectBusiness = (businessOrId: Business | string) => {
    const id = typeof businessOrId === 'string' ? businessOrId : businessOrId.businessId;
    setSelectedBusinessId(id);
    setSubView('business');
  };

  const handleSelectCategory = (cat: string) => {
    setSearchCategory(cat);
    setActiveTab('search');
  };

  const handleSearchSubmit = (queryStr: string) => {
    setSearchQuery(queryStr);
    setActiveTab('search');
  };

  const handleToggleCompare = (listing: Listing) => {
    setComparedListings((prev) => {
      const exists = prev.some((c) => c.listingId === listing.listingId);
      if (exists) {
        return prev.filter((c) => c.listingId !== listing.listingId);
      }
      if (prev.length >= 4) {
        alert('You can compare a maximum of 4 listings simultaneously.');
        return prev;
      }
      return [...prev, listing];
    });
  };

  const handlePublishListing = async (newListing: Listing) => {
    try {
      const bizId = newListing.businessId;
      const listingRef = doc(db, 'businesses', bizId, 'listings', newListing.listingId);
      await setDoc(listingRef, sanitizeForFirestore(newListing));
      setListings((prev) => [newListing, ...prev]);
      setSubView('none');
      setActiveTab('supplier');
    } catch (e) {
      console.error('Error saving listing to Firestore:', e);
    }
  };

  const handleUpdateAvailability = async (listingId: string, status: AvailabilityStatus) => {
    try {
      const listing = listings.find((l) => l.listingId === listingId);
      if (!listing) return;
      const listingRef = doc(db, 'businesses', listing.businessId, 'listings', listingId);
      await updateDoc(listingRef, {
        'availability.status': status,
        updatedAt: new Date().toISOString(),
      });
      setListings((prev) =>
        prev.map((l) =>
          l.listingId === listingId ? { ...l, availability: { ...l.availability, status } } : l
        )
      );
    } catch (e) {
      console.error('Error updating availability in Firestore:', e);
    }
  };

  const handleSendQuoteRequest = async (req: QuoteRequest) => {
    try {
      const reqRef = doc(db, 'quoteRequests', req.quoteRequestId);
      await setDoc(reqRef, sanitizeForFirestore(req));
    } catch (e) {
      console.error('Error sending quote request to Firestore:', e);
    }
  };

  const currentBusiness =
    businesses.find((b) => b.businessId === selectedBusinessId) ||
    businesses.find((b) => b.ownerId === currentUser?.uid) ||
    businesses[0];

  // Splash Screen (if explicitly enabled)
  if (showSplash) {
    return <Splash onFinish={handleSplashFinish} />;
  }

  // Initial Onboarding Screen with Role Choice (when explicitly requested)
  if (showRoleSelection && !currentUser && !isAuthModalOpen) {
    return (
      <Onboarding
        onComplete={handleRoleSelectionComplete}
        onSignInClick={() => {
          safeSetLocalStorage('constrora_onboarding_done', 'true');
          setShowRoleSelection(false);
          openSignInModal();
        }}
      />
    );
  }

  const effectiveRole: UserRole = currentUser?.role || selectedRole || 'client';
  const isSupplierRole = effectiveRole === 'supplier';

  // Protected Tab Guards: Unauthenticated users attempting to access protected tabs redirect to Get Started
  const protectedTabs: NavTab[] = ['profile', 'supplier', 'quotes', 'projects', 'saved', 'admin'];
  if (!currentUser && protectedTabs.includes(activeTab)) {
    return (
      <Onboarding
        onComplete={handleRoleSelectionComplete}
        onSignInClick={() => {
          safeSetLocalStorage('constrora_onboarding_done', 'true');
          setShowRoleSelection(false);
          openSignInModal();
        }}
      />
    );
  }

  const renderAdminView = () => {
    if (isAdmin) {
      return (
        <ChunkErrorBoundary>
          <Suspense
            fallback={
              <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#111111] flex items-center justify-center p-8">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B] mx-auto" />
                  <p className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                    Loading Management Console...
                  </p>
                </div>
              </div>
            }
          >
            <AdminDashboardView
              onSignOutAdmin={handleAdminSignOut}
            />
          </Suspense>
        </ChunkErrorBoundary>
      );
    }

    // Non-admin opens admin route -> Immediately redirect to normal portal without rendering access denied
    setTimeout(() => {
      setActiveTab(isSupplierRole ? 'supplier' : 'home');
      window.history.replaceState({}, '', '/');
    }, 0);
    return null;
  };

  const renderMainView = () => {
    if (subView === 'supplier_onboarding') {
      return (
        <SupplierOnboardingView
          onBackToRoleSelection={() => setShowRoleSelection(true)}
          onComplete={handleSupplierOnboardingFinished}
          onOpenAuthModal={() => openSignInModal()}
        />
      );
    }
    if (subView === 'client_onboarding') {
      return (
        <ClientOnboardingView
          onComplete={handleClientOnboardingFinished}
          onBackToRoleSelection={() => setShowRoleSelection(true)}
        />
      );
    }
    if (subView === 'detail' && selectedListing) {
      return (
        <ListingDetailView
          listing={selectedListing}
          onBack={() => setSubView('none')}
          onViewBusiness={(bizId) => {
            setSelectedBusinessId(bizId);
            setSubView('business');
          }}
          onCompareToggle={handleToggleCompare}
          isCompared={comparedListings.some((c) => c.listingId === selectedListing.listingId)}
          onQuoteSent={handleSendQuoteRequest}
        />
      );
    }
    if (subView === 'business' && currentBusiness) {
      return (
        <BusinessDetailView
          business={currentBusiness}
          listings={listings}
          onBack={() => setSubView('none')}
          onSelectListing={handleSelectListing}
          onCompareToggle={handleToggleCompare}
          comparedListings={comparedListings}
        />
      );
    }
    if (subView === 'add_listing') {
      return (
        <AddListingView
          businessId={currentBusiness?.businessId || `biz_${Date.now()}`}
          businessName={currentBusiness?.businessName || currentUser?.displayName || 'My Business'}
          onBack={() => setSubView('none')}
          onPublish={handlePublishListing}
        />
      );
    }

    if (activeTab === 'admin') {
      return renderAdminView();
    }

    if (activeTab === 'profile') {
      return (
        <ProfileView
          onOpenAuthModal={() => openSignInModal()}
          onOpenSignInModal={() => openSignInModal()}
          onOpenSignUpModal={() => openSignUpModal()}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            setSubView('none');
          }}
          quoteRequests={quoteRequests}
        />
      );
    }

    if (isSupplierRole) {
      const initialSupplierTab = activeTab === 'quotes' ? 'quotes' : 'listings';
      return (
        <SupplierDashboardView
          business={currentBusiness}
          listings={listings}
          initialTab={initialSupplierTab}
          onAddListingClick={() => setSubView('add_listing')}
          onUpdateAvailability={handleUpdateAvailability}
          quoteRequests={quoteRequests}
        />
      );
    }

    // Client/Default tabs
    if (activeTab === 'search') {
      return (
        <SearchView
          listings={listings}
          initialCategory={searchCategory}
          initialQuery={searchQuery}
          onBack={() => {
            setActiveTab('home');
            setSearchQuery('');
          }}
          onSelectListing={handleSelectListing}
          onCompareToggle={handleToggleCompare}
          comparedListings={comparedListings}
        />
      );
    }
    if (activeTab === 'saved') {
      return (
        <SavedView
          allListings={listings}
          allBusinesses={businesses}
          onSelectListing={handleSelectListing}
          onSelectBusiness={handleSelectBusiness}
          onCompareToggle={handleToggleCompare}
          comparedListings={comparedListings}
        />
      );
    }
    if (activeTab === 'projects') {
      return <ProjectsView onOpenProjectModal={() => setIsProjectModalOpen(true)} />;
    }

    // Default 'home'
    return (
      <HomeView
        listings={listings}
        onSelectListing={handleSelectListing}
        onSelectCategory={handleSelectCategory}
        onSearchSubmit={handleSearchSubmit}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        onCompareToggle={handleToggleCompare}
        comparedListings={comparedListings}
      />
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#111111] text-white' : 'bg-[#FFFFFF] text-[#111111]'} font-sans antialiased transition-colors`}>
      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      {/* Header */}
      <Header
        activeTab={activeTab}
        userRole={effectiveRole}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setSubView('none');
        }}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        onOpenAuthModal={() => openSignInModal()}
        onOpenSignInModal={() => openSignInModal()}
        onOpenSignUpModal={() => openSignUpModal()}
        onOpenCompareDrawer={() => setIsCompareDrawerOpen(true)}
        comparedCount={comparedListings.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderMainView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        userRole={effectiveRole}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setSubView('none');
        }}
      />

      {/* Modals & Drawers */}
      <ProjectSelectorModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authModalRole}
        initialIsSignUp={authModalIsSignUp}
        initialMode={authModalMode}
      />

      <CompareDrawer
        isOpen={isCompareDrawerOpen}
        onClose={() => setIsCompareDrawerOpen(false)}
        listings={comparedListings}
        onRemove={(id) =>
          setComparedListings((prev) => prev.filter((l) => l.listingId !== id))
        }
        onRequestQuote={(listing) => {
          setIsCompareDrawerOpen(false);
          handleSelectListing(listing);
        }}
      />
    </div>
  );
}

export default App;
