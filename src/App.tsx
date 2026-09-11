import React, { useState, useEffect } from 'react';
import { collection, collectionGroup, onSnapshot, doc, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { db, sanitizeForFirestore } from './lib/firebase';
import { useAuth } from './context/AuthContext';
import { useProject } from './context/ProjectContext';
import { useTheme } from './context/ThemeContext';
import { Listing, Business, UserRole, QuoteRequest } from './types';

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
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminSignInView } from './views/AdminSignInView';

export function App() {
  const { currentUser, setUserRole, signOut } = useAuth();
  const { activeProject } = useProject();
  const { isDark } = useTheme();

  const isAdminAuthorized =
    Boolean(currentUser) &&
    (currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'buildsafe247@gmail.com');

  const handleAdminSignOut = async () => {
    localStorage.removeItem('constrora_onboarding_done');
    localStorage.removeItem('constrora_temp_role');
    await signOut();
    setShowRoleSelection(true);
    setActiveTab('home');
    setSubView('none');
  };

  // Admin Route Listener for /admin and #admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash.startsWith('#admin')) {
        setActiveTab('admin');
      }
    };
    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    return () => window.removeEventListener('popstate', checkAdminRoute);
  }, []);

  // App Initialization Flow
  const [showSplash, setShowSplash] = useState(true);

  // Role and Onboarding State Management
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    if (currentUser?.role) return currentUser.role;
    const temp = localStorage.getItem('constrora_temp_role') as UserRole;
    return temp || 'client';
  });

  const [showRoleSelection, setShowRoleSelection] = useState(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (currentUser?.role === 'supplier' && currentUser?.supplierOnboardingCompleted) {
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('client');
  const [authModalIsSignUp, setAuthModalIsSignUp] = useState(false);
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);

  const openSignInModal = (role?: UserRole) => {
    setAuthModalRole(role || selectedRole);
    setAuthModalIsSignUp(false);
    setIsAuthModalOpen(true);
  };

  const openSignUpModal = (role?: UserRole) => {
    setAuthModalRole(role || selectedRole);
    setAuthModalIsSignUp(true);
    setIsAuthModalOpen(true);
  };

  // Compared Items & Requests
  const [comparedListings, setComparedListings] = useState<Listing[]>([]);

  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  // Real-time Firestore Sync for Businesses
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'businesses'),
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Business);
        setBusinesses(list);
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
        setListings(list);
      },
      (err) => console.warn('Listings listener warning:', err)
    );
    return () => unsub();
  }, []);

  // Real-time Firestore Sync for Quote Requests using targeted rules-compliant queries
  useEffect(() => {
    if (!currentUser) {
      setQuoteRequests([]);
      return;
    }

    if (currentUser.role === 'admin') {
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
  }, [currentUser?.uid, currentUser?.role, currentUser?.businessId]);

  // Sync user state on auth change
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role) {
        setSelectedRole(currentUser.role);
      }
      setShowRoleSelection(false);
      setSubView('none');
      if (currentUser.role === 'supplier') {
        setActiveTab('supplier');
      } else {
        setActiveTab('home');
      }
    } else {
      setSubView('none');
      setActiveTab('home');
      setShowRoleSelection(true);
    }
  }, [currentUser]);

  // Handlers
  const handleRoleSelectionComplete = async (role: UserRole) => {
    localStorage.setItem('constrora_onboarding_done', 'true');
    localStorage.setItem('constrora_temp_role', role);
    setSelectedRole(role);
    setShowRoleSelection(false);

    if (currentUser) {
      await setUserRole(role);
      setSubView('none');
      if (role === 'supplier') {
        setActiveTab('supplier');
      } else {
        setActiveTab('home');
      }
    } else {
      // Unauthenticated user clicking Get Started -> open 1-page AuthModal for registration
      setAuthModalRole(role);
      setAuthModalIsSignUp(true);
      setIsAuthModalOpen(true);
      if (role === 'supplier') {
        setActiveTab('supplier');
      } else {
        setActiveTab('home');
      }
    }
  };

  const handleSupplierOnboardingFinished = (newBiz: Business, firstListing?: Listing) => {
    setBusinesses((prev) => [newBiz, ...prev]);
    if (firstListing) {
      setListings((prev) => [firstListing, ...prev]);
    }
    setSelectedBusinessId(newBiz.businessId);
    setSubView('none');
    setActiveTab('supplier');
  };

  const handleClientOnboardingFinished = () => {
    setSubView('none');
    setActiveTab('home');
  };

  const handleSelectCategory = (cat: string) => {
    setSearchCategory(cat);
    setSearchQuery('');
    setSubView('none');
    setActiveTab('search');
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setSearchCategory('ALL');
    setSubView('none');
    setActiveTab('search');
  };

  const handleSelectListing = (listing: Listing) => {
    setSelectedListing(listing);
    setSubView('detail');
  };

  const handleSelectBusiness = (businessId: string) => {
    setSelectedBusinessId(businessId);
    setSubView('business');
  };

  const handleToggleCompare = (listing: Listing) => {
    if (comparedListings.some((c) => c.listingId === listing.listingId)) {
      setComparedListings(comparedListings.filter((c) => c.listingId !== listing.listingId));
    } else {
      if (comparedListings.length >= 4) {
        alert('You can compare up to 4 equipment or material listings at a time.');
        return;
      }
      setComparedListings([...comparedListings, listing]);
      setIsCompareDrawerOpen(true);
    }
  };

  const handleRemoveCompare = (listingId: string) => {
    setComparedListings(comparedListings.filter((c) => c.listingId !== listingId));
  };

  const handlePublishListing = async (newListing: Listing) => {
    setSubView('none');
    setActiveTab('supplier');
    try {
      const listingRef = doc(db, 'businesses', newListing.businessId, 'listings', newListing.listingId);
      await setDoc(listingRef, sanitizeForFirestore(newListing));
    } catch (e) {
      console.error('Error publishing listing to Firestore:', e);
    }
  };

  const handleUpdateAvailability = async (listingId: string, status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_STOCK') => {
    const target = listings.find((l) => l.listingId === listingId);
    if (target) {
      try {
        const listingRef = doc(db, 'businesses', target.businessId, 'listings', listingId);
        await updateDoc(listingRef, { 'availability.status': status, updatedAt: new Date().toISOString() });
      } catch (e) {
        console.error('Error updating listing availability in Firestore:', e);
      }
    }
  };

  const handleVerifyBusiness = async (businessId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const bizRef = doc(db, 'businesses', businessId);
      await updateDoc(bizRef, { verificationStatus: status, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.error('Error updating business verification in Firestore:', e);
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

  // Splash Screen
  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  // Initial Onboarding Screen with Role Choice
  if (showRoleSelection) {
    return (
      <Onboarding
        onComplete={handleRoleSelectionComplete}
        onSignInClick={() => {
          localStorage.setItem('constrora_onboarding_done', 'true');
          setShowRoleSelection(false);
          openSignInModal();
        }}
        onAdminClick={() => {
          localStorage.setItem('constrora_onboarding_done', 'true');
          setShowRoleSelection(false);
          setActiveTab('admin');
        }}
      />
    );
  }

  const effectiveRole: UserRole = currentUser?.role || selectedRole || 'client';
  const isSupplierRole = effectiveRole === 'supplier';

  const renderAdminView = () => {
    if (isAdminAuthorized) {
      return (
        <AdminDashboardView
          businesses={businesses}
          listings={listings}
          quoteRequests={quoteRequests}
          onVerifyBusiness={handleVerifyBusiness}
          onSignOutAdmin={handleAdminSignOut}
        />
      );
    }
    return (
      <AdminSignInView
        onSuccess={() => setActiveTab('admin')}
        onReturnHome={() => {
          setActiveTab('home');
          if (window.location.pathname.toLowerCase().startsWith('/admin')) {
            window.history.pushState({}, '', '/');
          }
        }}
        initialError={
          currentUser &&
          currentUser.email?.toLowerCase() !== 'buildsafe247@gmail.com' &&
          currentUser.role !== 'admin'
            ? 'Access denied. This Google account is not authorized to access the Constrora admin portal.'
            : null
        }
      />
    );
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
    <div
      className={`min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors ${
        isDark ? 'bg-[#0B0C0E] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Email Verification Banner */}
      <EmailVerificationBanner />

      {/* Top Header Navigation */}
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

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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

      {/* Global Modals */}
      <ProjectSelectorModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authModalRole}
        initialIsSignUp={authModalIsSignUp}
        onOpenAdminPortal={() => {
          setIsAuthModalOpen(false);
          setActiveTab('admin');
        }}
      />

      <CompareDrawer
        isOpen={isCompareDrawerOpen}
        onClose={() => setIsCompareDrawerOpen(false)}
        listings={comparedListings}
        onRemove={handleRemoveCompare}
        onRequestQuote={(listing) => {
          setSelectedListing(listing);
          setSubView('detail');
          setIsCompareDrawerOpen(false);
        }}
      />
    </div>
  );
}

export default App;
