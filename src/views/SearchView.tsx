import React, { useState } from 'react';
import { Search, Filter, Map, List, X, ShieldCheck, MapPin, SlidersHorizontal, ArrowLeft, RefreshCw } from 'lucide-react';
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

  // Count active filters (excluding default values)
  const activeFilterCount =
    (filters.category !== 'ALL' ? 1 : 0) +
    (filters.maxDistanceKm !== 100 ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.availableOnly ? 1 : 0) +
    (filters.deliveryOnly ? 1 : 0) +
    (filters.sortBy !== 'nearest' ? 1 : 0);

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
        const matchesBrand =
          item.brand?.toLowerCase().includes(q) ||
          item.manufacturer?.toLowerCase().includes(q) ||
          item.model?.toLowerCase().includes(q);
        const matchesBusiness = item.businessName?.toLowerCase().includes(q);
        const matchesSpecs = Object.values(item.specifications || {}).some(
          (val) => typeof val === 'string' && val.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesCategory && !matchesBrand && !matchesBusiness && !matchesSpecs) return false;
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
      const distA = calculateDistanceKm(
        activeProject.location.latitude,
        activeProject.location.longitude,
        a.location.latitude,
        a.location.longitude
      );
      const distB = calculateDistanceKm(
        activeProject.location.latitude,
        activeProject.location.longitude,
        b.location.latitude,
        b.location.longitude
      );

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

  const resetFilters = () => {
    setSearchQuery('');
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
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Search Header Container */}
      <div className="rounded-2xl bg-[#111318] border border-slate-800 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equipment, cement, tippers, suppliers..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {/* View Mode Switcher */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-orange-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="h-3.5 w-3.5" /> LIST
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'map' ? 'bg-orange-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Map className="h-3.5 w-3.5" /> MAP
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                showFilters || activeFilterCount > 0
                  ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>FILTERS</span>
              {activeFilterCount > 0 && (
                <span className="bg-orange-500 text-black text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Chips Bar */}
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
                  ? 'bg-orange-500 text-black shadow'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-2xl bg-[#111318] border border-orange-500/30 p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-orange-400 flex items-center gap-1.5 uppercase tracking-wider">
              <SlidersHorizontal className="h-4 w-4" /> DISCOVERY FILTERS
            </h4>
            <button
              onClick={resetFilters}
              className="text-slate-400 hover:text-orange-400 underline text-[11px] font-semibold cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Max Distance Slider */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">
                Max Distance from Site: <strong className="text-orange-400">{filters.maxDistanceKm} km</strong>
              </label>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={filters.maxDistanceKm}
                onChange={(e) => setFilters({ ...filters, maxDistanceKm: Number(e.target.value) })}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">Sort Results</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-orange-500"
              >
                <option value="nearest">Nearest to Project Site</option>
                <option value="price_asc">Lowest Price First</option>
                <option value="price_desc">Highest Price First</option>
                <option value="rating">Highest Rated Supplier</option>
              </select>
            </div>

            {/* Checkbox Toggles */}
            <div className="flex flex-col gap-2 pt-1 font-semibold text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                  className="accent-orange-500 rounded"
                />
                <span>✓ Verified Suppliers Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
                  className="accent-orange-500 rounded"
                />
                <span>Currently Available Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.deliveryOnly}
                  onChange={(e) => setFilters({ ...filters, deliveryOnly: e.target.checked })}
                  className="accent-orange-500 rounded"
                />
                <span>Site Delivery Available</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
        <div>
          Showing <strong className="text-white font-bold">{filteredListings.length}</strong> construction resources near{' '}
          <strong className="text-orange-400 font-bold">{activeProject.name}</strong> ({activeProject.location.city})
        </div>
      </div>

      {/* Results View */}
      {viewMode === 'list' ? (
        filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
          <div className="rounded-2xl bg-[#111318] border border-slate-800 p-12 text-center space-y-3">
            <Search className="h-10 w-10 text-orange-500 mx-auto" />
            <h3 className="font-bold text-white text-base uppercase">No Construction Resources Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              Try expanding your distance filter, clearing search keywords, or selecting a different category.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-1.5 bg-orange-500 text-black font-extrabold px-4 py-2 rounded-xl text-xs hover:bg-orange-400 transition-all cursor-pointer uppercase tracking-wider"
            >
              Reset Search & Filters
            </button>
          </div>
        )
      ) : (
        <MapView listings={filteredListings} onSelectListing={onSelectListing} />
      )}
    </div>
  );
};

