import React, { useState, useEffect } from 'react';
import { Search, MapPin, Wrench, Package, Truck, Building2, ArrowRight, HardHat, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
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
  'Search cement (e.g. Dangote 50kg)...',
  'Search CAT 320 Excavator...',
  'Search 350L Concrete Mixer...',
  'Search 10 Ton Tipper Haulage...',
  'Search 9-inch Vibrated Blocks...',
  'Search Granite / Sharp Sand...',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Rotate placeholder every 2.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  const categories = [
    {
      id: 'CONSTRUCTION MATERIALS',
      title: 'CONSTRUCTION MATERIALS',
      subtitle: 'Cement, Blocks, Sand, Granite, Rebar, Steel',
      icon: Package,
      badge: 'Supplies',
      color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    },
    {
      id: 'CONSTRUCTION EQUIPMENT',
      title: 'EQUIPMENT & RENTALS',
      subtitle: 'Excavators, Mixers, Compactors, Power, Cranes',
      icon: Wrench,
      badge: 'Fleet Yard',
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    },
    {
      id: 'CONSTRUCTION LOGISTICS',
      title: 'LOGISTICS & HAULAGE',
      subtitle: '10T/20T Tippers, Lowbeds, Haulage Logistics',
      icon: Truck,
      badge: 'Transport',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    },
    {
      id: 'CONSTRUCTION BUSINESSES',
      title: 'VERIFIED SUPPLIERS',
      subtitle: 'Material Depots, Rental Yards, Subcontractors',
      icon: Building2,
      badge: 'Certified',
      color: 'border-amber-500/40 text-amber-500 bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Industrial Hero Banner Section */}
      <div className="relative rounded-3xl bg-[#121418] dark:bg-[#121418] light:bg-white border-2 border-slate-800 dark:border-slate-800 light:border-slate-200 p-6 sm:p-12 overflow-hidden shadow-2xl transition-colors bg-grid-industrial">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-500 border border-amber-500/30 uppercase tracking-widest">
              <HardHat className="h-4 w-4" />
              <span>PROJECT SITE RESOURCE DISCOVERY</span>
            </div>

            {onNavigateToAdmin && (
              <button
                type="button"
                onClick={onNavigateToAdmin}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer hover:border-amber-500/80 shadow-md shadow-amber-500/5"
              >
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <span>ADMIN PORTAL</span>
              </button>
            )}
          </div>

          <h1 className="font-['Cabinet_Grotesk'] text-4xl sm:text-6xl font-black text-white dark:text-white light:text-slate-900 leading-tight uppercase tracking-tight">
            WHAT DO YOU NEED TO <span className="text-amber-500">BUILD?</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium leading-relaxed">
            Find actual construction materials, heavy machinery rentals, tipper transport, and verified suppliers around your active construction site.
          </p>

          {/* Main Search Bar with Rotating Placeholder */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                className="w-full bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border-2 border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white dark:text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-500 text-black font-black px-8 py-4 rounded-2xl text-sm hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/20 uppercase tracking-wider shrink-0"
            >
              SEARCH NOW
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400 pt-1">
            <span className="text-slate-500 uppercase tracking-wider">POPULAR SEARCHES:</span>
            {['CAT 320 Excavator', 'Dangote Cement', 'Concrete Mixer', '10 Ton Tipper', '9-Inch Blocks'].map(
              (term, idx) => (
                <button
                  key={idx}
                  onClick={() => onSearchSubmit(term)}
                  className="bg-slate-900 dark:bg-slate-900 light:bg-slate-100 hover:bg-amber-500/10 text-slate-300 dark:text-slate-300 light:text-slate-700 px-3 py-1.5 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-300 hover:border-amber-500/50 transition-colors cursor-pointer"
                >
                  {term}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Construction Core Categories */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-6 rounded-2xl bg-[#121418] dark:bg-[#121418] light:bg-white border-2 border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-amber-500 transition-all text-left flex flex-col justify-between space-y-4 cursor-pointer shadow-lg hover:shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl border-2 ${cat.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                    {cat.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-white dark:text-white light:text-slate-900 group-hover:text-amber-500 transition-colors uppercase">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 font-medium mt-1">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-black text-amber-500 pt-2 uppercase tracking-wider">
                  <span>EXPLORE CATEGORY</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Available Near Your Construction Site */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white dark:text-white light:text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <span>AVAILABLE AROUND SITE</span>
              <span className="text-xs bg-amber-500/10 text-amber-500 font-black px-3 py-1 rounded-lg border border-amber-500/30">
                📍 {activeProject.location.city}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 font-medium mt-1">
              Actual machinery, raw materials, and haulage logistics available near {activeProject.name}.
            </p>
          </div>

          <button
            onClick={() => onSelectCategory('ALL')}
            className="text-xs font-black text-amber-500 hover:text-amber-400 flex items-center gap-1 uppercase tracking-wider shrink-0"
          >
            <span>VIEW ALL ({listings.length} LISTINGS)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="rounded-2xl bg-[#121418] border-2 border-slate-800 p-12 text-center space-y-4">
            <MapPin className="h-12 w-12 text-amber-500 mx-auto" />
            <h3 className="font-black text-white text-lg uppercase">NO LISTINGS FOUND NEAR THIS SITE</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Expand your site radius or change your active project location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
