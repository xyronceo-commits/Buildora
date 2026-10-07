import React, { useState } from 'react';
import { MapPin, Bookmark, Scale, Eye, Wrench, Package, Truck } from 'lucide-react';
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
  const [imgError, setImgError] = useState(false);

  const saved = isSaved(listing.listingId);
  const distanceStr = formatDistance(activeProject.location, listing.location);

  const renderTypeBadge = () => {
    switch (listing.type) {
      case 'equipment':
        return (
          <span className="inline-flex items-center gap-1.5 bg-zinc-950/85 text-amber-400 border border-amber-400/30 text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider backdrop-blur-xs">
            <Wrench className="h-3 w-3" /> EQUIPMENT
          </span>
        );
      case 'material':
        return (
          <span className="inline-flex items-center gap-1.5 bg-zinc-950/85 text-zinc-100 border border-zinc-700 text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider backdrop-blur-xs">
            <Package className="h-3 w-3" /> MATERIAL
          </span>
        );
      case 'logistics':
        return (
          <span className="inline-flex items-center gap-1.5 bg-zinc-950/85 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider backdrop-blur-xs">
            <Truck className="h-3 w-3" /> LOGISTICS
          </span>
        );
      default:
        return null;
    }
  };

  const getPriceDisplay = () => {
    if (listing.type === 'equipment' && listing.rental?.dailyPrice) {
      return { price: `₦${listing.rental.dailyPrice.toLocaleString()}`, unit: 'DAY' };
    }
    if (listing.price) {
      return { price: `₦${listing.price.toLocaleString()}`, unit: (listing.priceUnit || 'UNIT').toUpperCase() };
    }
    return { price: 'CONTACT', unit: 'QUOTE' };
  };

  const priceObj = getPriceDisplay();
  const hasPhoto = listing.photos && listing.photos.length > 0 && !imgError;
  const primaryPhoto = hasPhoto ? listing.photos[0] : null;

  // Key specifications snippet based on type (unboxed metadata)
  const getSpecsSnippet = () => {
    const specs = listing.specifications || {};
    const items: string[] = [];

    if (listing.type === 'equipment') {
      if (specs.operatingWeight) items.push(specs.operatingWeight);
      if (specs.enginePower) items.push(specs.enginePower);
      if (specs.bucketCapacity) items.push(specs.bucketCapacity);
      if (listing.condition) items.push(listing.condition);
    } else if (listing.type === 'material') {
      if (listing.brand) items.push(listing.brand);
      if (specs.size || specs.grade) items.push((specs.size || specs.grade)!);
      if (specs.unit) items.push(specs.unit);
    } else if (listing.type === 'logistics') {
      if (specs.payloadCapacity) items.push(specs.payloadCapacity);
      if (specs.vehicleType) items.push(specs.vehicleType);
      if (listing.delivery?.serviceArea) items.push(listing.delivery.serviceArea);
    }

    return items;
  };

  const specSnippet = getSpecsSnippet();

  return (
    <article className="group relative rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 hover:border-[#FBBF24] dark:hover:border-[#FBBF24] transition-all duration-200 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        {primaryPhoto ? (
          <img
            src={primaryPhoto}
            alt={listing.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-400 p-4 text-center">
            {listing.type === 'equipment' ? (
              <Wrench className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-2" />
            ) : listing.type === 'material' ? (
              <Package className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-2" />
            ) : (
              <Truck className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-2" />
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              No photo available
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {renderTypeBadge()}
        </div>

        {/* Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSave(
              listing.type === 'equipment' ? 'equipment' : listing.type === 'material' ? 'material' : 'logistics',
              listing.listingId
            );
          }}
          className={`absolute top-3 right-3 h-9 w-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            saved
              ? 'bg-[#FBBF24] text-zinc-950 font-black'
              : 'bg-zinc-950/70 text-white hover:bg-[#FBBF24] hover:text-zinc-950 border border-white/20'
          }`}
          title={saved ? 'Saved' : 'Save resource'}
          aria-label={saved ? 'Remove from saved' : 'Save resource'}
        >
          <Bookmark className="h-4 w-4" />
        </button>

        {/* Availability Tag */}
        <div className="absolute bottom-3 left-3">
          {listing.availability.status === 'AVAILABLE' ? (
            <span className="inline-flex items-center gap-1.5 bg-zinc-950/85 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> AVAILABLE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-zinc-950/85 text-zinc-300 border border-zinc-700 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider backdrop-blur-xs">
              {listing.availability.status}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Supplier Name & Verification */}
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1.5">
            <span className="truncate font-bold uppercase tracking-wider text-[11px] text-zinc-700 dark:text-zinc-300">
              {listing.businessName}
            </span>
            <VerificationBadge status={listing.businessVerification} size="sm" />
          </div>

          {/* Listing Title */}
          <h3 className="font-['Cabinet_Grotesk'] text-base font-black text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
            {listing.title}
          </h3>

          {/* Unboxed Metadata Specs Line (Anti-Slop Zero Pill Discipline) */}
          {specSnippet.length > 0 && (
            <p className="mt-2 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-1">
              {specSnippet.map((spec, idx) => (
                <React.Fragment key={idx}>
                  <span>{spec}</span>
                  {idx < specSnippet.length - 1 && (
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  )}
                </React.Fragment>
              ))}
            </p>
          )}
        </div>

        {/* Price & Location Footer */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{distanceStr} away</span>
            </div>

            <div className="text-right shrink-0">
              <div className="text-base font-black font-mono tabular-nums text-zinc-950 dark:text-amber-400 leading-none">
                {priceObj.price}
              </div>
              <div className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-1">
                PER {priceObj.unit}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(listing)}
              className="flex-1 min-h-[42px] flex items-center justify-center gap-1.5 rounded-lg bg-[#FBBF24] hover:bg-[#F59E0B] text-zinc-950 py-2 px-3 text-xs font-black transition-colors cursor-pointer uppercase tracking-wider"
            >
              <Eye className="h-3.5 w-3.5" /> View Details
            </button>

            {onCompareToggle && (
              <button
                onClick={() => onCompareToggle(listing)}
                className={`min-h-[42px] min-w-[42px] p-2 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
                  isCompared
                    ? 'bg-[#FBBF24]/20 border-[#FBBF24] text-zinc-950 dark:text-[#FBBF24]'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-[#FBBF24]'
                }`}
                title={isCompared ? 'Remove from compare' : 'Compare resource'}
                aria-label={isCompared ? 'Remove from compare' : 'Compare resource'}
              >
                <Scale className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
