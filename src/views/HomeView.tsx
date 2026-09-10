import React, { useState, useEffect } from 'react';
import { Search, MapPin, Wrench, Package, Truck, Building2, ArrowRight, HardHat, ShieldCheck, Bookmark, Sparkles } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useSaved } from '../context/SavedContext';
import { Listing } from '../types';
import { ListingCard } from '../components/ListingCard';

interface HomeViewProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onSelectCategory: (category: string) => void;
  onSearchSubmit: (query: string) => void;
  onOpenProjectModal: () => void;
  onCompareToggle: (listing: Listing) => void;
  comparedListings: Listing[];
  onNavigateToAdmin?: () => void;
}

const SEARCH_PLACEHOLDERS = [
  'Search equipment, materials, logistics...',
  'Search Dangote Cement 50kg...',
  'Search CAT 320 Excavator...',
  'Search 350L Concrete Mixer...',
  'Search 10 Ton Tipper Haulage...',
  'Search 9-inch Vibrated Blocks...',
];

export const HomeView: React.FC<HomeViewProps> = ({
  listings,
  onSelectListing,
  onSelectCategory,
  onSearchSubmit,
  onOpenProjectModal,
  onCompareToggle,
  comparedListings,
  onNavigateToAdmin,
}) => {
  const { activeProject } = useProject();
  const { currentUser } = useAuth();
  const { savedIds } = useSaved();
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Rotate placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = currentUser?.displayName || currentUser?.companyName || 'Builder';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  const categories = [
    {
      id: 'CONSTRUCTION MATERIALS',
      title: 'Materials',
      subtitle: 'Cement, Blocks, Steel, Sand',
      icon: Package,
    },
    {
      id: 'CONSTRUCTION EQUIPMENT',
      title: 'Equipment',
      subtitle: 'Excavators, Mixers, Cranes',
      icon: Wrench,
    },
    {
      id: 'CONSTRUCTION LOGISTICS',
      title: 'Logistics',
      subtitle: 'Tippers, Lowbeds, Haulage',
      icon: Truck,
    },
    {
      id: 'CONSTRUCTION BUSINESSES',
      title: 'Businesses',
      subtitle: 'Depots, Yards, Suppliers',
      icon: Building2,
    },
  ];

  // Filter saved listings if any
  const savedListings = listings.filter((l) => savedIds.includes(l.listingId));

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Hero Search Section */}
      <div className="relative rounded-2xl bg-[#111318] border border-slate-800 p-6 sm:p-10 space-y-6">
        {/* Top Greeting Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
              <HardHat className="h-4 w-4" />
              <span>CONSTRORA DISCOVERY</span>
            </div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-300">
              {getGreeting()}, <span className="text-white font-bold">{userName}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenProjectModal}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              <MapPin className="h-3.5 w-3.5 text-orange-500" />
              <span>Site: <strong className="text-white">{activeProject.name}</strong></span>
            </button>

            {onNavigateToAdmin && (
              <button
                type="button"
                onClick={onNavigateToAdmin}
                className="inline-flex items-center gap-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
                <span>ADMIN</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Question */}
        <div className="space-y-2">
          <h1 className="font-['Cabinet_Grotesk',sans-serif] text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight uppercase">
            WHAT DO YOU NEED TO <span className="text-orange-500">BUILD?</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Find what you need to build — heavy equipment rentals, materials, and tipper transport near your site.
          </p>
        </div>

        {/* Large Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="bg-orange-500 text-black font-black px-7 py-3.5 rounded-xl text-xs hover:bg-orange-400 transition-all cursor-pointer uppercase tracking-wider shrink-0"
          >
            SEARCH NOW
          </button>
        </form>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400 pt-1">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Popular:</span>
          {['CAT 320 Excavator', 'Dangote Cement', 'Concrete Mixer', '10 Ton Tipper', '9-Inch Blocks'].map(
            (term, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSearchSubmit(term)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-orange-400 px-3 py-1 rounded-lg border border-slate-800 hover:border-orange-500/40 text-xs font-medium transition-colors cursor-pointer"
              >
                {term}
              </button>
            )
          )}
        </div>
      </div>

      {/* Category Shortcuts */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-1">
          Category Shortcuts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-4 rounded-xl bg-[#111318] border border-slate-800 hover:border-orange-500/80 transition-all text-left flex items-center gap-3.5 cursor-pointer shadow-sm"
              >
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-orange-500 group-hover:bg-orange-500 group-hover:text-black transition-colors shrink-0">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-['Cabinet_Grotesk',sans-serif] text-sm font-black text-white group-hover:text-orange-400 transition-colors truncate">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    {cat.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Near Your Project Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <h2 className="font-['Cabinet_Grotesk',sans-serif] text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>NEAR YOUR PROJECT</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Available resources near {activeProject.name} ({activeProject.location.city})
            </p>
          </div>

          <button
            onClick={() => onSelectCategory('ALL')}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <span>SEE ALL ({listings.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((item) => (
              <ListingCard
                key={item.listingId}
                listing={item}
                onViewDetails={onSelectListing}
                onCompareToggle={onCompareToggle}
                isCompared={comparedListings.some((c) => c.listingId === item.listingId)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#111318] border border-slate-800 p-10 text-center space-y-3">
            <MapPin className="h-10 w-10 text-orange-500 mx-auto" />
            <h3 className="font-bold text-white text-base uppercase">No Resources Found Near Your Site</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              Adjust your project location or clear search filters to discover available resources.
            </p>
          </div>
        )}
      </div>

      {/* Saved Resources Entry Point */}
      {savedListings.length > 0 && (
        <div className="rounded-xl bg-[#111318] border border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Your Saved Binder</h3>
              <p className="text-xs text-slate-400">
                You have {savedListings.length} saved {savedListings.length === 1 ? 'resource' : 'resources'} ready for project comparison.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectCategory('SAVED')}
            className="text-xs font-extrabold text-black bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-xl transition-all cursor-pointer uppercase tracking-wider shrink-0"
          >
            View Binder
          </button>
        </div>
      )}
    </div>
  );
};

