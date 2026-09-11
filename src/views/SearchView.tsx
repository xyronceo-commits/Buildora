import React, { useState, useEffect } from 'react';
import { Search, Filter, Map, List, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { Listing, FilterState } from '../types';
import { ListingCard } from '../components/ListingCard';
import { MapView } from '../components/MapView';
import { useProject } from '../context/ProjectContext';
import { calculateDistanceKm } from '../utils/distance';

interface SearchViewProps {
  listings: Listing[];
  initialCategory?: string;
  initialQuery?: string;
  onBack?: () => void;
  onSelectListing: (listing: Listing) => void;
  onCompareToggle: (listing: Listing) => void;
  comparedListings: Listing[];
}

export const SearchView: React.FC<SearchViewProps> = ({
  listings,
  initialCategory = 'ALL',
  initialQuery = '',
  onBack,
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

  // Sync initial props
  useEffect(() => {
    setSearchQuery(initialQuery);
    setFilters((prev) => ({ ...prev, category: initialCategory, query: initialQuery }));
  }, [initialQuery, initialCategory]);

  // Enhanced Filtering Logic for Exact Resource Discovery
  const filteredListings = listings
    .filter((item) => {
      // Category filter
      if (filters.category !== 'ALL' && filters.category) {
        if (filters.category === 'CONSTRUCTION EQUIPMENT' && item.type !== 'equipment') return false;
        if (filters.category === 'CONSTRUCTION MATERIALS' && item.type !== 'material') return false;
        if (filters.category === 'CONSTRUCTION LOGISTICS' && item.type !== 'logistics') return false;
      }

      // Exact Query Search (checking title, category, subcategory, brand, model, manufacturer, specs, business name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title ? item.title.toLowerCase().includes(q) : false;
        const matchesCategory =
          (item.category ? item.category.toLowerCase().includes(q) : false) ||
          (item.subcategory ? item.subcategory.toLowerCase().includes(q) : false);
        const matchesBrand =
          Boolean(item.brand && item.brand.toLowerCase().includes(q)) ||
          Boolean(item.manufacturer && item.manufacturer.toLowerCase().includes(q)) ||
          Boolean(item.model && item.model.toLowerCase().includes(q)) ||
          Boolean(item.modelNumber && item.modelNumber.toLowerCase().includes(q));
        const matchesBusiness = item.businessName ? item.businessName.toLowerCase().includes(q) : false;

        // Specs values match
        const specsValues = item.specifications ? Object.values(item.specifications).join(' ').toLowerCase() : '';
        const matchesSpecs = specsValues ? specsValues.includes(q) : false;

        if (!matchesTitle && !matchesCategory && !matchesBrand && !matchesBusiness && !matchesSpecs) {
          return false;
        }
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
      if (filters.availableOnly && item.availability?.status !== 'AVAILABLE') return false;

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

  return (
    <div className="space-y-6 pb-20">
      {/* Search Header */}
      <div className="rounded-2xl bg-white dark:bg-[#121418] border border-[#E5E5E5] dark:border-slate-800 p-4 space-y-4 shadow-2xs">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B7280] hover:text-[#111111] dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#6B7280] dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equipment (CAT 320), materials (Dangote Cement), logistics (10T Tipper)..."
              className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-[#111111] dark:text-white placeholder-[#6B7280] focus:outline-none focus:border-[#FBBF24] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {/* View Mode Switcher */}
            <div className="flex bg-[#F7F7F5] dark:bg-slate-900 p-1 rounded-xl border border-[#E5E5E5] dark:border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-[#FBBF24] text-[#111111]' : 'text-[#6B7280] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <List className="h-3.5 w-3.5" /> List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'map' ? 'bg-[#FBBF24] text-[#111111]' : 'text-[#6B7280] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <Map className="h-3.5 w-3.5" /> Map
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                showFilters
                  ? 'bg-[#FBBF24]/15 border-[#FBBF24] text-[#B45309] dark:text-[#FBBF24]'
                  : 'bg-[#F7F7F5] dark:bg-slate-900 border-[#E5E5E5] dark:border-slate-800 text-[#111111] dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
          </div>
        </div>

        {/* Category Shortcuts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { label: 'All Resources', value: 'ALL' },
            { label: 'Equipment', value: 'CONSTRUCTION EQUIPMENT' },
            { label: 'Materials', value: 'CONSTRUCTION MATERIALS' },
            { label: 'Logistics', value: 'CONSTRUCTION LOGISTICS' },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilters({ ...filters, category: cat.value })}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all text-xs ${
                filters.category === cat.value
                  ? 'bg-[#FBBF24] text-[#111111] shadow-sm'
                  : 'bg-[#F7F7F5] dark:bg-slate-900 text-[#6B7280] dark:text-slate-400 border border-[#E5E5E5] dark:border-slate-800 hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Filter Controls Panel */}
      {showFilters && (
        <div className="rounded-2xl bg-white dark:bg-[#121418] border border-[#FBBF24]/40 p-4 space-y-4 text-xs shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-slate-800 pb-2">
            <h4 className="font-bold text-[#B45309] dark:text-[#FBBF24] flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4" /> Filter Resources
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
              className="text-[#6B7280] hover:text-[#B45309] dark:text-slate-400 dark:hover:text-[#FBBF24] underline text-[11px] cursor-pointer"
            >
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Max Distance Slider */}
            <div>
              <label className="font-bold text-[#374151] dark:text-slate-300 block mb-1">
                Max Distance from Site: <span className="text-[#B45309] dark:text-[#FBBF24] font-extrabold">{filters.maxDistanceKm} km</span>
              </label>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={filters.maxDistanceKm}
                onChange={(e) => setFilters({ ...filters, maxDistanceKm: Number(e.target.value) })}
                className="w-full accent-[#FBBF24] cursor-pointer"
              />
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="font-bold text-[#374151] dark:text-slate-300 block mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
                className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24]"
              >
                <option value="nearest">Nearest to Project Site</option>
                <option value="price_asc">Lowest Price First</option>
                <option value="price_desc">Highest Price First</option>
                <option value="rating">Highest Rated Supplier</option>
              </select>
            </div>

            {/* Checkbox Toggles */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#374151] dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                  className="accent-[#FBBF24] rounded cursor-pointer"
                />
                <span>✓ Verified Suppliers Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#374151] dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
                  className="accent-[#FBBF24] rounded cursor-pointer"
                />
                <span>Currently Available Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#374151] dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={filters.deliveryOnly}
                  onChange={(e) => setFilters({ ...filters, deliveryOnly: e.target.checked })}
                  className="accent-[#FBBF24] rounded cursor-pointer"
                />
                <span>Site Delivery Available</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Results Header Summary */}
      <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-slate-400 px-1">
        <div>
          Showing <strong className="text-[#111111] dark:text-white">{filteredListings.length}</strong> resources around{' '}
          <strong className="text-[#B45309] dark:text-[#FBBF24]">{activeProject.name}</strong> ({activeProject.location.city})
        </div>
      </div>

      {/* Results Display */}
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
          <div className="rounded-2xl bg-white dark:bg-[#121418] border border-[#E5E5E5] dark:border-slate-800 p-12 text-center space-y-3 shadow-2xs">
            <Search className="h-10 w-10 text-[#F59E0B] mx-auto" />
            <h3 className="font-bold text-[#111111] dark:text-white text-base">No construction resources found</h3>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 max-w-sm mx-auto">
              Try a different search or adjust your filters.
            </p>
          </div>
        )
      ) : (
        <MapView listings={filteredListings} onSelectListing={onSelectListing} />
      )}
    </div>
  );
};

