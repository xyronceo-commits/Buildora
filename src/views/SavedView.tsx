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
      <div className="rounded-2xl bg-[#121418] border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-2 text-amber-500">
          <Bookmark className="h-6 w-6" />
          <h1 className="font-['Cabinet_Grotesk'] text-2xl font-extrabold text-white">
            PROJECT SAVED BINDER ({savedItems.length})
          </h1>
        </div>
        <p className="text-xs text-slate-400">
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
                  ? 'bg-amber-500 text-black shadow'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {savedItems.length === 0 ? (
        <div className="rounded-2xl bg-[#121418] border border-slate-800 p-12 text-center space-y-3">
          <Bookmark className="h-10 w-10 text-amber-500 mx-auto opacity-50" />
          <h3 className="font-bold text-white text-base">NOTHING SAVED YET</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
