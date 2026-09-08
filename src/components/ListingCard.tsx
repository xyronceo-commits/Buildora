import React from 'react';
import { MapPin, Bookmark, Scale, Eye, Wrench, Package, Truck, ShieldCheck } from 'lucide-react';
import { Listing } from '../types';
import { useProject } from '../context/ProjectContext';
import { useSaved } from '../context/SavedContext';
import { formatDistance } from '../utils/distance';
import { VerificationBadge } from './VerificationBadge';

interface ListingCardProps {
  listing: Listing;
  onViewDetails: (listing: Listing) => void;
  onCompareToggle?: (listing: Listing) => void;
  isCompared?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onViewDetails,
  onCompareToggle,
  isCompared = false,
}) => {
  const { activeProject } = useProject();
  const { isSaved, toggleSave } = useSaved();

  const saved = isSaved(listing.listingId);
  const distanceStr = formatDistance(activeProject.location, listing.location);

  const renderTypeBadge = () => {
    switch (listing.type) {
      case 'equipment':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-500 text-black text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
            <Wrench className="h-3 w-3" /> EQUIPMENT
          </span>
        );
      case 'material':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
            <Package className="h-3 w-3" /> MATERIAL
          </span>
        );
      case 'logistics':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
            <Truck className="h-3 w-3" /> LOGISTICS
          </span>
        );
      default:
        return null;
    }
  };

  const getPriceDisplay = () => {
    if (listing.type === 'equipment' && listing.rental) {
      if (listing.rental.dailyPrice) {
        return { price: `₦${listing.rental.dailyPrice.toLocaleString()}`, unit: 'DAY' };
      }
    }
    if (listing.price) {
      return { price: `₦${listing.price.toLocaleString()}`, unit: (listing.priceUnit || 'UNIT').toUpperCase() };
    }
    return { price: 'CONTACT', unit: 'QUOTE' };
  };

  const priceObj = getPriceDisplay();

  return (
    <div className="group relative rounded-xl bg-[#121418] dark:bg-[#121418] light:bg-white border-2 border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-amber-500 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-2xl">
      {/* Heavy Machinery Photo Banner */}
      <div className="relative h-48 sm:h-52 w-full bg-slate-900 overflow-hidden">
        <img
          src={listing.photos[0] || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80'}
          alt={listing.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-transparent to-black/50" />

        {/* Type Badge Header */}
        <div className="absolute top-3 left-3">
          {renderTypeBadge()}
        </div>

        {/* Save button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSave(
              listing.type === 'equipment' ? 'equipment' : listing.type === 'material' ? 'material' : 'logistics',
              listing.listingId
            );
          }}
          className={`absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            saved
              ? 'bg-amber-500 text-black font-extrabold shadow-md'
              : 'bg-black/70 text-slate-300 hover:text-amber-400 backdrop-blur-md border border-slate-700'
          }`}
          title={saved ? 'Saved' : 'Save to Binder'}
        >
          <Bookmark className="h-4 w-4" />
        </button>

        {/* Prominent Availability Indicator */}
        <div className="absolute bottom-3 left-3">
          {listing.availability.status === 'AVAILABLE' ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-black text-[11px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider shadow-md">
              <span className="h-2 w-2 rounded-full bg-black animate-pulse" /> AVAILABLE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-amber-500 text-black text-[11px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider shadow-md">
              {listing.availability.status}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Supplier Name & Verified Badge */}
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mb-1.5">
            <span className="truncate font-bold uppercase tracking-wider text-slate-300 dark:text-slate-300 light:text-slate-700">
              {listing.businessName}
            </span>
            <VerificationBadge status={listing.businessVerification} size="sm" />
          </div>

          {/* Large Machinery Title */}
          <h3 className="font-['Cabinet_Grotesk'] text-base sm:text-lg font-black text-white dark:text-white light:text-slate-900 leading-snug group-hover:text-amber-500 transition-colors">
            {listing.title}
          </h3>

          {/* Technical Specifications Pills */}
          {listing.specifications && (
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
              {listing.specifications.operatingWeight && (
                <span className="bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-800 px-2 py-0.5 rounded border border-slate-800 dark:border-slate-800 light:border-slate-300">
                  {listing.specifications.operatingWeight}
                </span>
              )}
              {listing.specifications.enginePower && (
                <span className="bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-800 px-2 py-0.5 rounded border border-slate-800 dark:border-slate-800 light:border-slate-300">
                  {listing.specifications.enginePower}
                </span>
              )}
              {listing.specifications.bucketCapacity && (
                <span className="bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-800 px-2 py-0.5 rounded border border-slate-800 dark:border-slate-800 light:border-slate-300">
                  {listing.specifications.bucketCapacity}
                </span>
              )}
              {listing.specifications.brand && (
                <span className="bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-800 px-2 py-0.5 rounded border border-slate-800 dark:border-slate-800 light:border-slate-300">
                  {listing.specifications.brand}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Rate & Distance Footer */}
        <div className="pt-3 border-t-2 border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <div
                className="flex items-center gap-1.5 text-slate-300 dark:text-slate-300 light:text-slate-800 text-xs font-extrabold truncate"
                title={listing.location.address ? `${listing.location.address}, ${listing.location.city}` : `${listing.location.city}, ${listing.location.state}`}
              >
                <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="truncate">
                  {listing.location.address ? `${listing.location.address}, ${listing.location.city}` : `${listing.location.city}, ${listing.location.state}`}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold pl-5">
                {distanceStr} from site
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-lg sm:text-xl font-black text-amber-500 dark:text-amber-500 light:text-amber-600 tracking-tight leading-none">
                {priceObj.price}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                PER {priceObj.unit}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onViewDetails(listing)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-black py-2.5 px-3 text-xs font-black hover:bg-amber-400 transition-all cursor-pointer shadow-md shadow-amber-500/10 uppercase tracking-wider"
            >
              <Eye className="h-4 w-4" /> VIEW RESOURCE
            </button>

            {onCompareToggle && (
              <button
                onClick={() => onCompareToggle(listing)}
                className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                  isCompared
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-500'
                }`}
                title={isCompared ? 'Remove from compare' : 'Add to compare'}
              >
                <Scale className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
