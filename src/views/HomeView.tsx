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
    }, 3000);
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
      title: 'Materials',
      subtitle: 'Cement, rebar, blocks, aggregates',
      icon: Package,
    },
    {
      id: 'CONSTRUCTION EQUIPMENT',
      title: 'Equipment',
      subtitle: 'Excavators, mixers, power, compaction',
      icon: Wrench,
    },
    {
      id: 'CONSTRUCTION LOGISTICS',
      title: 'Logistics',
      subtitle: 'Tippers, lowbeds, haulage services',
      icon: Truck,
    },
    {
      id: 'CONSTRUCTION BUSINESSES',
      title: 'Businesses',
      subtitle: 'Material depots, rental yards',
      icon: Building2,
    },
  ];

  // Filter listings near active project (up to 6 for home display)
  const nearbyListings = listings.slice(0, 6);

  // Filter saved listings if any
  const savedListings = listings.filter((l) => savedItems?.some((s) => s.referenceId === l.listingId)).slice(0, 3);

  return (
    <div className="space-y-8 pb-20">
      {/* Client Discovery Header */}
      <div className="rounded-3xl bg-[#F7F7F5] dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] p-6 sm:p-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] dark:border-[#374151] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#111111] dark:text-[#FBBF24] bg-[#FBBF24]/20 px-3 py-1 rounded-lg border border-[#FBBF24]/40">
              CONSTRORA DISCOVERY
            </span>
          </div>
        </div>

        {/* User Greeting & Question */}
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
            {getGreetingTime()}, {userName}
          </p>
          <h1 className="font-['Cabinet_Grotesk'] text-3xl sm:text-5xl font-black text-[#111111] dark:text-white leading-tight uppercase tracking-tight">
            WHAT DO YOU NEED TO <span className="text-[#F59E0B] dark:text-[#FBBF24]">BUILD?</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium">
            Find what you need to build — heavy equipment, materials & transport near{' '}
            <strong className="text-[#111111] dark:text-white">{activeProject.name}</strong> ({activeProject.location.city}).
          </p>
        </div>

        {/* Search Field */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-4 h-5 w-5 text-[#6B7280] dark:text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
              className="w-full bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#374151] rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-[#111111] dark:text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#FBBF24] focus:ring-2 focus:ring-[#FBBF24]/20 transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black px-8 py-3.5 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer uppercase tracking-wider shrink-0 shadow-xs"
          >
            Search Resources
          </button>
        </form>

        {/* Popular Search Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] pt-1">
          <span className="text-[#6B7280] dark:text-[#9CA3AF] text-[11px] uppercase tracking-wider">POPULAR:</span>
          {['CAT 320 Excavator', 'Dangote Cement 50kg', '350L Concrete Mixer', '10 Ton Tipper'].map(
            (term, idx) => (
              <button
                key={idx}
                onClick={() => onSearchSubmit(term)}
                className="bg-white dark:bg-[#111111] hover:bg-[#FBBF24]/10 text-[#111111] dark:text-[#F3F4F6] px-3 py-1 rounded-xl border border-[#E5E5E5] dark:border-[#374151] hover:border-[#FBBF24] text-[11px] font-bold transition-colors cursor-pointer"
              >
                {term}
              </button>
            )
          )}
        </div>
      </div>

      {/* Category Shortcuts */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#6B7280] dark:text-[#9CA3AF] px-1">
          Resource Categories
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-4 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] hover:border-[#FBBF24] dark:hover:border-[#FBBF24] transition-all text-left flex items-center justify-between cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-[#F7F7F5] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#374151] text-[#F59E0B] dark:text-[#FBBF24] shrink-0 group-hover:border-[#FBBF24]/60 transition-colors">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-['Cabinet_Grotesk'] text-sm font-black text-[#111111] dark:text-white group-hover:text-[#F59E0B] dark:group-hover:text-[#FBBF24] transition-colors truncate">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate font-medium">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-[#F59E0B] dark:group-hover:text-[#FBBF24] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Near Your Project */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-['Cabinet_Grotesk'] text-xl sm:text-2xl font-black text-[#111111] dark:text-white uppercase tracking-tight flex items-center gap-2">
              <span>Near Your Project</span>
              <span className="text-xs bg-[#FBBF24]/15 text-[#111111] dark:text-[#FBBF24] font-black px-2.5 py-0.5 rounded-lg border border-[#FBBF24]/40">
                📍 {activeProject.location.city}
              </span>
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium mt-0.5">
              Available equipment, materials & transport near {activeProject.name}
            </p>
          </div>

          <button
            onClick={() => onSelectCategory('ALL')}
            className="text-xs font-black text-[#F59E0B] dark:text-[#FBBF24] hover:text-[#D97706] flex items-center gap-1 uppercase tracking-wider shrink-0"
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
          <div className="rounded-2xl bg-[#F7F7F5] dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] p-10 text-center space-y-3">
            <MapPin className="h-10 w-10 text-[#F59E0B] mx-auto" />
            <h3 className="font-black text-[#111111] dark:text-white text-sm uppercase">No construction resources found</h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] max-w-xs mx-auto">
              Try a different search or adjust your active project location.
            </p>
          </div>
        )}
      </div>

      {/* Saved Section Entry Point if User has saved items */}
      {savedListings.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#E5E5E5] dark:border-[#374151]">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-['Cabinet_Grotesk'] text-lg font-black text-[#111111] dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-[#F59E0B]" />
              <span>Saved Resources</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {savedListings.map((item) => (
              <div
                key={item.listingId}
                onClick={() => onSelectListing(item)}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] hover:border-[#FBBF24] transition-colors cursor-pointer flex items-center gap-3 shadow-xs"
              >
                <div className="h-12 w-12 rounded-xl bg-[#F7F7F5] dark:bg-[#111111] overflow-hidden shrink-0 border border-[#E5E5E5] dark:border-[#374151]">
                  {item.photos && item.photos[0] ? (
                    <img src={item.photos[0]} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#6B7280] dark:text-slate-600">
                      <Layers className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-[#111111] dark:text-white truncate">{item.title}</h4>
                  <p className="text-[10px] font-bold text-[#111111] dark:text-[#FBBF24] mt-0.5">
                    {item.rental?.dailyPrice ? `₦${item.rental.dailyPrice.toLocaleString()}/day` : item.price ? `₦${item.price.toLocaleString()}` : 'Contact'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

