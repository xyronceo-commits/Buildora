import React, { useState } from 'react';
import { Search, Filter, Map, List, X, ShieldCheck, MapPin, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Listing, FilterState } from '../types';
import { ListingCard } from '../components/ListingCard';
import { MapView } from '../components/MapView';
import { useProject } from '../context/ProjectContext';
import { calculateDistanceKm } from '../utils/distance';

interface SearchViewProps {
  listings: Listing[];
  initialCategory?: string;
  initialQuery?: string;
  onSelectListing: (listing: Listing) => void;
  onCompareToggle: (listing: Listing) => void;
  comparedListings: Listing[];
}

export const SearchView: React.FC<SearchViewProps> = ({
  listings,
  initialCategory = 'ALL',
  initialQuery = '',
  onSelectListing,
  onCompareToggle,
  comparedListings,
}) => {
  const { activeProject } = useProject();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    query: initialQuery,
    maxDistanceKm: 100,
    minPrice: null,
    maxPrice: null,
    minRating: null,
    verifiedOnly: false,
    availableOnly: false,
    deliveryOnly: false,
    condition: 'ALL',
    sortBy: 'nearest',
  });

  // Filtering Logic
  const filteredListings = listings
    .filter((item) => {
      // Category filter
      if (filters.category !== 'ALL' && filters.category) {
        if (filters.category === 'CONSTRUCTION EQUIPMENT' && item.type !== 'equipment') return false;
        if (filters.category === 'CONSTRUCTION MATERIALS' && item.type !== 'material') return false;
        if (filters.category === 'CONSTRUCTION LOGISTICS' && item.type !== 'logistics') return false;
      }

      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesBrand = item.brand?.toLowerCase().includes(q) || item.manufacturer?.toLowerCase().includes(q) || item.model?.toLowerCase().includes(q);
        const matchesBusiness = item.businessName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory && !matchesBrand && !matchesBusiness) return false;
      }

      // Distance filter
      const dist = calculateDistanceKm(
        activeProject.location.latitude,
        activeProject.location.longitude,
        item.location.latitude,
        item.location.longitude
      );
      if (dist > filters.maxDistanceKm) return false;

      // Verification filter
      if (filters.verifiedOnly && item.businessVerification !== 'VERIFIED') return false;

      // Availability filter
      if (filters.availableOnly && item.availability.status !== 'AVAILABLE') return false;

      // Delivery filter
      if (filters.deliveryOnly && !item.delivery?.available) return false;

      return true;
    })
    .sort((a, b) => {
      const distA = calculateDistanceKm(activeProject.location.latitude, activeProject.location.longitude, a.location.latitude, a.location.longitude);
      const distB = calculateDistanceKm(activeProject.location.latitude, activeProject.location.longitude, b.location.latitude, b.location.longitude);

      if (filters.sortBy === 'nearest') {
        return distA - distB;
      }
      if (filters.sortBy === 'rating') {
        return (b.businessRating || 0) - (a.businessRating || 0);
      }
      if (filters.sortBy === 'price_asc') {
        const priceA = a.rental?.dailyPrice || a.price || 9999999;
        const priceB = b.rental?.dailyPrice || b.price || 9999999;
        return priceA - priceB;
      }
      if (filters.sortBy === 'price_desc') {
        const priceA = a.rental?.dailyPrice || a.price || 0;
        const priceB = b.rental?.dailyPrice || b.price || 0;
        return priceB - priceA;
      }
      return 0;
    });

  return (
    <div className="space-y-6 pb-20">
      {/* Search Bar Header */}
      <div className="rounded-2xl bg-[#121418] border border-slate-800 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equipment, cement, tippers, suppliers..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* View Mode Switcher */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" /> LIST
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'map' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Map className="h-4 w-4" /> MAP
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                showFilters
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Filter className="h-4 w-4" /> FILTERS
            </button>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { label: 'ALL RESOURCES', value: 'ALL' },
            { label: 'EQUIPMENT', value: 'CONSTRUCTION EQUIPMENT' },
            { label: 'MATERIALS', value: 'CONSTRUCTION MATERIALS' },
            { label: 'LOGISTICS', value: 'CONSTRUCTION LOGISTICS' },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilters({ ...filters, category: cat.value })}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
                filters.category === cat.value
                  ? 'bg-amber-500 text-black shadow'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="rounded-2xl bg-[#121418] border border-amber-500/30 p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4" /> DISCOVERY FILTERS
            </h4>
            <button
              onClick={() =>
                setFilters({
                  category: 'ALL',
                  query: '',
                  maxDistanceKm: 100,
                  minPrice: null,
                  maxPrice: null,
                  minRating: null,
                  verifiedOnly: false,
                  availableOnly: false,
                  deliveryOnly: false,
                  condition: 'ALL',
                  sortBy: 'nearest',
                })
              }
              className="text-slate-400 hover:text-amber-400 underline text-[11px]"
            >
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Max Distance Slider */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Max Distance from Site: <span className="text-amber-400">{filters.maxDistanceKm} km</span>
              </label>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={filters.maxDistanceKm}
                onChange={(e) => setFilters({ ...filters, maxDistanceKm: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="nearest">Nearest to Project Site</option>
                <option value="price_asc">Lowest Price First</option>
                <option value="price_desc">Highest Price First</option>
                <option value="rating">Highest Rated Supplier</option>
              </select>
            </div>

            {/* Checkbox Toggles */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                  className="accent-amber-500 rounded"
                />
                <span>✓ Verified Suppliers Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
                  className="accent-amber-500 rounded"
                />
                <span>Currently Available Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={filters.deliveryOnly}
                  onChange={(e) => setFilters({ ...filters, deliveryOnly: e.target.checked })}
                  className="accent-amber-500 rounded"
                />
                <span>Site Delivery Available</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing <strong className="text-white">{filteredListings.length}</strong> resources around{' '}
          <strong className="text-amber-400">{activeProject.name}</strong> ({activeProject.location.city})
        </div>
      </div>

      {/* Results Display */}
      {viewMode === 'list' ? (
        filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => (
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
          <div className="rounded-2xl bg-[#121418] border border-slate-800 p-12 text-center space-y-3">
            <Search className="h-10 w-10 text-amber-500 mx-auto" />
            <h3 className="font-bold text-white text-base">NOTHING FOUND NEAR YOUR PROJECT</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try expanding your distance filter, clearing keywords, or changing project location.
            </p>
          </div>
        )
      ) : (
        <MapView listings={filteredListings} onSelectListing={onSelectListing} />
      )}
    </div>
  );
};
