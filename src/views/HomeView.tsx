import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Wrench,
  Package,
  Truck,
  Building2,
  ArrowRight,
  Bookmark,
  Layers,
} from 'lucide-react';
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
}

const SEARCH_PLACEHOLDERS = [
  'Search CAT 320 Excavator...',
  'Search Dangote Cement 50kg...',
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
}) => {
  const { activeProject } = useProject();
  const { currentUser } = useAuth();
  const { savedItems } = useSaved();

  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Dynamic Greeting based on time of day
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = currentUser?.displayName
    ? currentUser.displayName.split(' ')[0]
    : currentUser?.email
    ? currentUser.email.split('@')[0]
    : 'Builder';

  // Rotate placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  // Counts by category
  const materialCount = listings.filter((l) => l.type === 'material').length;
  const equipmentCount = listings.filter((l) => l.type === 'equipment').length;
  const logisticsCount = listings.filter((l) => l.type === 'logistics').length;

  const categories = [
    {
      id: 'CONSTRUCTION MATERIALS',
      title: 'Materials',
      subtitle: `${materialCount} listings · Cement, rebar, aggregates`,
      icon: Package,
    },
    {
      id: 'CONSTRUCTION EQUIPMENT',
      title: 'Plant & Equipment',
      subtitle: `${equipmentCount} listings · Excavators, mixers, power`,
      icon: Wrench,
    },
    {
      id: 'CONSTRUCTION LOGISTICS',
      title: 'Site Logistics',
      subtitle: `${logisticsCount} listings · Tippers, lowbeds, haulage`,
      icon: Truck,
    },
    {
      id: 'CONSTRUCTION BUSINESSES',
      title: 'Verified Suppliers',
      subtitle: 'Depots, fleet yards, trade stores',
      icon: Building2,
    },
  ];

  // Filter listings near active project (up to 6 for home display)
  const nearbyListings = listings.slice(0, 6);

  // Filter saved listings if any
  const savedListings = listings.filter((l) => savedItems?.some((s) => s.referenceId === l.listingId)).slice(0, 3);

  return (
    <div className="space-y-8 pb-20">
      {/* Industrial Hero Discovery Box */}
      <section className="rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 space-y-6">
        {/* Active Site Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-[#FBBF24] uppercase tracking-wider">
            <span>Heavy Machinery</span>
            <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>Certified Materials</span>
            <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>Site Logistics</span>
          </div>

          <button
            onClick={onOpenProjectModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer group"
          >
            <MapPin className="h-3.5 w-3.5 text-amber-500" />
            <span>Site: <strong className="text-zinc-900 dark:text-zinc-100">{activeProject.name}</strong> ({activeProject.location.city})</span>
            <span className="text-amber-500 font-bold ml-1 group-hover:underline">Change</span>
          </button>
        </div>

        {/* User Greeting & Question */}
        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {getGreetingTime()}, {userName}
          </p>
          <h1 className="font-['Cabinet_Grotesk'] text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white leading-tight uppercase tracking-tight text-balance">
            WHAT DO YOU NEED TO <span className="text-amber-500 dark:text-[#FBBF24]">BUILD?</span>
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 font-medium max-w-2xl text-pretty">
            Locate heavy machinery, certified building materials and tipper haulage within immediate reach of{' '}
            <strong className="text-zinc-950 dark:text-white">{activeProject.location.city}</strong>.
          </p>
        </div>

        {/* Search Field */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-12 pr-10 py-3.5 text-sm font-semibold text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#FBBF24] focus:ring-2 focus:ring-[#FBBF24]/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-[#FBBF24] hover:bg-[#F59E0B] text-zinc-950 font-black px-8 py-3.5 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer uppercase tracking-wider shrink-0 min-h-[44px]"
          >
            Search Resources
          </button>
        </form>

        {/* Popular Search Terms */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold pt-1">
          <span className="text-zinc-400 dark:text-zinc-500 text-[11px] uppercase tracking-wider">POPULAR:</span>
          {['CAT 320 Excavator', 'Dangote Cement 50kg', '350L Concrete Mixer', '10 Ton Tipper', 'Sharp Sand 20T'].map(
            (term, idx) => (
              <button
                key={idx}
                onClick={() => onSearchSubmit(term)}
                className="bg-zinc-100 hover:bg-[#FBBF24]/20 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 px-3 py-1 rounded border border-zinc-200 dark:border-zinc-800 hover:border-amber-400 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                {term}
              </button>
            )
          )}
        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Resource Categories
          </h2>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            {listings.length} verified listings
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-4 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 hover:border-[#FBBF24] dark:hover:border-[#FBBF24] transition-all text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-[#FBBF24] shrink-0 group-hover:bg-[#FBBF24] group-hover:text-zinc-950 transition-colors">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-['Cabinet_Grotesk'] text-sm font-black text-zinc-950 dark:text-white group-hover:text-amber-500 dark:group-hover:text-[#FBBF24] transition-colors truncate">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-medium">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-amber-500 dark:group-hover:text-[#FBBF24] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Near Your Project */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-['Cabinet_Grotesk'] text-xl sm:text-2xl font-black text-zinc-950 dark:text-white uppercase tracking-tight flex items-baseline gap-2">
              <span>Near Your Project</span>
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">· {activeProject.location.city}</span>
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">
              Available plant, materials and logistics around {activeProject.name}
            </p>
          </div>

          <button
            onClick={() => onSelectCategory('ALL')}
            className="text-xs font-black text-amber-500 hover:text-amber-600 dark:text-[#FBBF24] flex items-center gap-1 uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <span>See all ({listings.length})</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {nearbyListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {nearbyListings.map((item) => (
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
          <div className="rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-10 text-center space-y-3">
            <MapPin className="h-10 w-10 text-amber-500 mx-auto" />
            <h3 className="font-black text-zinc-950 dark:text-white text-sm uppercase">No construction resources found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
              Try a different search or adjust your active project location.
            </p>
          </div>
        )}
      </section>

      {/* Saved Resources Section if any */}
      {savedListings.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-['Cabinet_Grotesk'] text-lg font-black text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-amber-500" />
              <span>Saved Resources</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {savedListings.map((item) => (
              <div
                key={item.listingId}
                onClick={() => onSelectListing(item)}
                className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 hover:border-[#FBBF24] transition-colors cursor-pointer flex items-center gap-3"
              >
                <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800">
                  {item.photos && item.photos[0] ? (
                    <img src={item.photos[0]} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-400">
                      <Layers className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-zinc-950 dark:text-white truncate">{item.title}</h4>
                  <p className="text-[11px] font-bold text-amber-600 dark:text-[#FBBF24] mt-0.5">
                    {item.rental?.dailyPrice ? `₦${item.rental.dailyPrice.toLocaleString()}/day` : item.price ? `₦${item.price.toLocaleString()}` : 'Contact'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
