import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useProject } from './context/ProjectContext';
import { useTheme } from './context/ThemeContext';
import { Listing, Business, UserRole, QuoteRequest } from './types';
import { INITIAL_LISTINGS, INITIAL_BUSINESSES } from './data/seedData';

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
    await signOut();
    setActiveTab('admin');
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

  const SAMPLE_QUOTE_REQUESTS: QuoteRequest[] = [
    {
      quoteRequestId: 'req_sample_101',
      clientId: 'client_01',
      userId: 'client_01',
      supplierBusinessId: 'biz_osun_heavy',
      businessId: 'biz_osun_heavy',
      listingId: 'list_cat320_01',
      listingTitle: 'CAT 320 Excavator',
      clientName: 'Engineer Michael Adebayo',
      clientPhone: '+234 803 112 2334',
      clientEmail: 'michael@adebayoconstruction.ng',
      projectName: 'Commercial Plaza Substructure',
      projectLocation: 'Gbongan Road, Osogbo, Osun State',
      requiredDate: '18 Sept 2026',
      items: [
        {
          listingId: 'list_cat320_01',
          name: 'CAT 320 Excavator',
          quantity: '5',
          unit: 'Days',
          specifications: '22 Ton crawler excavator with experienced operator',
        },
      ],
      itemName: 'CAT 320 Excavator',
      quantity: '5 Days',
      message: 'Site work starts next week. Please provide daily rate including mobilization fee to Gbongan Road site.',
      status: 'sent',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      quoteRequestId: 'req_sample_102',
      clientId: 'client_02',
      userId: 'client_02',
      supplierBusinessId: 'biz_osun_heavy',
      businessId: 'biz_osun_heavy',
      listingId: 'list_dangote_04',
      listingTitle: 'Dangote Cement 50kg (Bag)',
      clientName: 'Chief Rotimi Williams',
      clientPhone: '+234 802 998 8776',
      clientEmail: 'rotimi@williamshomes.com',
      projectName: '3 Bedroom Residential Duplex',
      projectLocation: 'Ring Road Area, Osogbo, Osun State',
      requiredDate: '15 Sept 2026',
      items: [
        {
          listingId: 'list_dangote_04',
          name: 'Dangote Cement 50kg',
          quantity: '200',
          unit: 'Bags',
          specifications: 'Grade 42.5N',
        },
        {
          name: 'Granite (3/4 inch)',
          quantity: '3',
          unit: 'Trips',
          specifications: 'Quarry crushed',
        },
      ],
      itemName: 'Dangote Cement 50kg + Granite',
      quantity: '200 Bags, 3 Trips',
      message: 'Required for foundation slab pour. Please confirm stock availability and offloading cost.',
      status: 'sent',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];

  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>(() => {
    const saved = localStorage.getItem('constrora_quote_requests_v3') || localStorage.getItem('buildora_quote_requests_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse quote requests from localStorage:', e);
      }
    }
    return SAMPLE_QUOTE_REQUESTS;
  });

  // Master Data collections with automatic persistence across page reloads
  const DEMO_LISTING_IDS = [
    'list_cat320_01',
    'list_komatsu210_02',
    'list_mixer350_03',
    'list_dangote_04',
    'list_blocks9inch_05',
    'list_tipper10ton_06',
    'list_tipper10t_05',
  ];

  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem('constrora_listings_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove all demo listings
          const userOnlyListings = parsed.filter((item: Listing) => !DEMO_LISTING_IDS.includes(item.listingId));
          return userOnlyListings;
        }
      } catch (e) {
        console.error('Failed to parse listings from localStorage:', e);
      }
    }
    return INITIAL_LISTINGS;
  });

  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem('constrora_businesses_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse businesses from localStorage:', e);
      }
    }
    return INITIAL_BUSINESSES;
  });

  // Automatically save state to localStorage whenever modified
  useEffect(() => {
    localStorage.setItem('constrora_listings_v3', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('constrora_quote_requests_v3', JSON.stringify(quoteRequests));
  }, [quoteRequests]);

  useEffect(() => {
    localStorage.setItem('constrora_businesses_v3', JSON.stringify(businesses));
  }, [businesses]);

  // Sync user state on auth change
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role) {
        setSelectedRole(currentUser.role);
      }
      setSubView('none');
      if (currentUser.role === 'supplier') {
        setActiveTab('supplier');
      } else {
        setActiveTab('home');
      }
    } else {
      setSubView('none');
      setActiveTab('home');
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

  const handlePublishListing = (newListing: Listing) => {
    setListings([newListing, ...listings]);
    setSubView('none');
    setActiveTab('supplier');
  };

  const handleUpdateAvailability = (listingId: string, status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_STOCK') => {
    setListings((prev) =>
      prev.map((l) => (l.listingId === listingId ? { ...l, availability: { ...l.availability, status } } : l))
    );
  };

  const handleVerifyBusiness = (businessId: string, status: 'VERIFIED' | 'REJECTED') => {
    setBusinesses((prev) =>
      prev.map((b) => (b.businessId === businessId ? { ...b, verificationStatus: status } : b))
    );
  };

  const handleSendQuoteRequest = (req: QuoteRequest) => {
    setQuoteRequests([req, ...quoteRequests]);
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
        {/* SubView Render Rules */}
        {subView === 'supplier_onboarding' ? (
          <SupplierOnboardingView
            onBackToRoleSelection={() => setShowRoleSelection(true)}
            onComplete={handleSupplierOnboardingFinished}
            onOpenAuthModal={() => openSignInModal()}
          />
        ) : subView === 'client_onboarding' ? (
          <ClientOnboardingView
            onComplete={handleClientOnboardingFinished}
            onBackToRoleSelection={() => setShowRoleSelection(true)}
          />
        ) : subView === 'detail' && selectedListing ? (
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
        ) : subView === 'business' && currentBusiness ? (
          <BusinessDetailView
            business={currentBusiness}
            listings={listings}
            onBack={() => setSubView('none')}
            onSelectListing={handleSelectListing}
            onCompareToggle={handleToggleCompare}
            comparedListings={comparedListings}
          />
        ) : subView === 'add_listing' ? (
          <AddListingView
            businessId={currentBusiness.businessId}
            businessName={currentBusiness.businessName}
            onBack={() => setSubView('none')}
            onPublish={handlePublishListing}
          />
        ) : isSupplierRole ? (
          /* STRICT SUPPLIER DASHBOARD: NO DISCOVER, ONLY HOMEPAGE (LISTINGS), REQUEST FOR QUOTES, AND PROFILE */
          activeTab === 'quotes' ? (
            <SupplierDashboardView
              business={currentBusiness}
              listings={listings}
              initialTab="quotes"
              onAddListingClick={() => setSubView('add_listing')}
              onUpdateAvailability={handleUpdateAvailability}
              quoteRequests={quoteRequests}
            />
          ) : activeTab === 'profile' ? (
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
          ) : activeTab === 'admin' ? (
            isAdminAuthorized ? (
              <AdminDashboardView
                businesses={businesses}
                listings={listings}
                onVerifyBusiness={handleVerifyBusiness}
                onSignOutAdmin={handleAdminSignOut}
              />
            ) : (
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
            )
          ) : (
            <SupplierDashboardView
              business={currentBusiness}
              listings={listings}
              initialTab="listings"
              onAddListingClick={() => setSubView('add_listing')}
              onUpdateAvailability={handleUpdateAvailability}
              quoteRequests={quoteRequests}
            />
          )
        ) : activeTab === 'home' ? (
          <HomeView
            listings={listings}
            onSelectListing={handleSelectListing}
            onSelectCategory={handleSelectCategory}
            onSearchSubmit={handleSearchSubmit}
            onOpenProjectModal={() => setIsProjectModalOpen(true)}
            onCompareToggle={handleToggleCompare}
            comparedListings={comparedListings}
            onNavigateToAdmin={() => setActiveTab('admin')}
          />
        ) : activeTab === 'search' ? (
          <SearchView
            listings={listings}
            initialCategory={searchCategory}
            initialQuery={searchQuery}
            onSelectListing={handleSelectListing}
            onCompareToggle={handleToggleCompare}
            comparedListings={comparedListings}
          />
        ) : activeTab === 'saved' ? (
          <SavedView
            allListings={listings}
            allBusinesses={businesses}
            onSelectListing={handleSelectListing}
            onSelectBusiness={handleSelectBusiness}
            onCompareToggle={handleToggleCompare}
            comparedListings={comparedListings}
          />
        ) : activeTab === 'projects' ? (
          <ProjectsView onOpenProjectModal={() => setIsProjectModalOpen(true)} />
        ) : activeTab === 'profile' ? (
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
        ) : activeTab === 'admin' ? (
          isAdminAuthorized ? (
            <AdminDashboardView
              businesses={businesses}
              listings={listings}
              onVerifyBusiness={handleVerifyBusiness}
              onSignOutAdmin={handleAdminSignOut}
            />
          ) : (
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
          )
        ) : (
          <HomeView
            listings={listings}
            onSelectListing={handleSelectListing}
            onSelectCategory={handleSelectCategory}
            onSearchSubmit={handleSearchSubmit}
            onOpenProjectModal={() => setIsProjectModalOpen(true)}
            onCompareToggle={handleToggleCompare}
            comparedListings={comparedListings}
            onNavigateToAdmin={() => setActiveTab('admin')}
          />
        )}
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
