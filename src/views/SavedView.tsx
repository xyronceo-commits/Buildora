import React, { useState } from 'react';
import { Bookmark, Wrench, Package, Truck, Building2, Trash2, ArrowRight } from 'lucide-react';
import { useSaved } from '../context/SavedContext';
import { Listing, Business } from '../types';
import { ListingCard } from '../components/ListingCard';

interface SavedViewProps {
  allListings: Listing[];
  allBusinesses: Business[];
  onSelectListing: (listing: Listing) => void;
  onSelectBusiness: (businessId: string) => void;
  onCompareToggle: (listing: Listing) => void;
  comparedListings: Listing[];
}

export const SavedView: React.FC<SavedViewProps> = ({
  allListings,
  allBusinesses,
  onSelectListing,
  onSelectBusiness,
  onCompareToggle,
  comparedListings,
}) => {
  const { savedItems } = useSaved();
  const [activeTab, setActiveTab] = useState<'all' | 'equipment' | 'material' | 'logistics' | 'business'>('all');

  const savedListings = allListings.filter((l) =>
    savedItems.some((s) => s.referenceId === l.listingId)
  );

  const savedBiz = allBusinesses.filter((b) =>
    savedItems.some((s) => s.referenceId === b.businessId)
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="rounded-2xl bg-white dark:bg-[#121418] border border-[#E5E5E5] dark:border-slate-800 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 text-[#B45309] dark:text-[#FBBF24]">
          <Bookmark className="h-6 w-6 text-[#F59E0B]" />
          <h1 className="font-['Cabinet_Grotesk'] text-2xl font-extrabold text-[#111111] dark:text-white">
            PROJECT SAVED BINDER ({savedItems.length})
          </h1>
        </div>
        <p className="text-xs text-[#6B7280] dark:text-slate-400">
          Keep your shortlisted heavy equipment models, material suppliers, tippers and businesses in one place.
        </p>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'ALL SAVED' },
            { id: 'equipment', label: 'EQUIPMENT' },
            { id: 'material', label: 'MATERIALS' },
            { id: 'logistics', label: 'LOGISTICS' },
            { id: 'business', label: 'BUSINESSES' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'equipment' | 'material' | 'logistics' | 'business')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-[#FBBF24] text-[#111111] shadow-sm'
                  : 'bg-[#F7F7F5] dark:bg-slate-900 text-[#6B7280] dark:text-slate-400 border border-[#E5E5E5] dark:border-slate-800 hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {savedItems.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#121418] border border-[#E5E5E5] dark:border-slate-800 p-12 text-center space-y-3 shadow-2xs">
          <Bookmark className="h-10 w-10 text-[#F59E0B] mx-auto opacity-50" />
          <h3 className="font-bold text-[#111111] dark:text-white text-base">NOTHING SAVED YET</h3>
          <p className="text-xs text-[#6B7280] dark:text-slate-400 max-w-sm mx-auto">
            Bookmark equipment rentals, cement depots or tipper trucks while searching to organize your project choices.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedListings.map((item) => (
            <ListingCard
              key={item.listingId}
              listing={item}
              onViewDetails={onSelectListing}
              onCompareToggle={onCompareToggle}
              isCompared={comparedListings.some((c) => c.listingId === item.listingId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
