import React, { useState } from 'react';
import { MapPin, Bookmark, Scale, Eye, Wrench, Package, Truck, CheckCircle2 } from 'lucide-react';
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
          <span className="inline-flex items-center gap-1 bg-[#FBBF24] text-[#111111] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
            <Wrench className="h-3 w-3" /> EQUIPMENT
          </span>
        );
      case 'material':
        return (
          <span className="inline-flex items-center gap-1 bg-[#111111] text-white dark:bg-white dark:text-[#111111] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
            <Package className="h-3 w-3" /> MATERIAL
          </span>
        );
      case 'logistics':
        return (
          <span className="inline-flex items-center gap-1 bg-[#1F2937] text-white dark:bg-slate-700 dark:text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
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

  // Key specifications snippet based on type
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
    <div className="group relative rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] hover:border-[#FBBF24] dark:hover:border-[#FBBF24] transition-all duration-200 flex flex-col overflow-hidden shadow-xs hover:shadow-md">
      {/* Image Container */}
      <div className="relative h-44 sm:h-48 w-full bg-[#F7F7F5] dark:bg-[#111111] overflow-hidden">
        {primaryPhoto ? (
          <img
            src={primaryPhoto}
            alt={listing.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-[#F7F7F5] dark:bg-[#111111] text-[#6B7280] p-4 text-center">
            {listing.type === 'equipment' ? (
              <Wrench className="h-10 w-10 text-[#6B7280] dark:text-slate-600 mb-2" />
            ) : listing.type === 'material' ? (
              <Package className="h-10 w-10 text-[#6B7280] dark:text-slate-600 mb-2" />
            ) : (
              <Truck className="h-10 w-10 text-[#6B7280] dark:text-slate-600 mb-2" />
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">
              No Image Uploaded
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

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
          className={`absolute top-3 right-3 h-8 w-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            saved
              ? 'bg-[#FBBF24] text-[#111111] font-black shadow-md'
              : 'bg-black/60 text-white hover:bg-[#FBBF24] hover:text-[#111111] backdrop-blur-md border border-white/20'
          }`}
          title={saved ? 'Saved' : 'Save resource'}
        >
          <Bookmark className="h-4 w-4" />
        </button>

        {/* Availability Badge */}
        <div className="absolute bottom-3 left-3">
          {listing.availability.status === 'AVAILABLE' ? (
            <span className="inline-flex items-center gap-1.5 bg-[#FBBF24] text-[#111111] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#111111] animate-pulse" /> AVAILABLE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-[#F7F7F5] dark:bg-[#1F2937] text-[#111111] dark:text-white border border-[#E5E5E5] dark:border-[#374151] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              {listing.availability.status}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Supplier Name & Verification */}
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">
            <span className="truncate font-bold uppercase tracking-wider text-[11px]">
              {listing.businessName}
            </span>
            <VerificationBadge status={listing.businessVerification} size="sm" />
          </div>

          {/* Listing Title */}
          <h3 className="font-['Cabinet_Grotesk'] text-base font-black text-[#111111] dark:text-white leading-snug group-hover:text-[#F59E0B] transition-colors line-clamp-2">
            {listing.title}
          </h3>

          {/* Key Specs Pills */}
          {specSnippet.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] font-bold text-[#1F2937] dark:text-slate-300">
              {specSnippet.map((spec, idx) => (
                <span
                  key={idx}
                  className="bg-[#F7F7F5] dark:bg-[#111111] text-[#1F2937] dark:text-slate-300 px-2 py-0.5 rounded-md border border-[#E5E5E5] dark:border-[#374151]"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Location Footer */}
        <div className="pt-3 border-t border-[#E5E5E5] dark:border-[#374151] space-y-2.5">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-semibold flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#F59E0B] shrink-0" />
                <span className="truncate">{distanceStr} away</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-base font-black text-[#111111] dark:text-[#FBBF24] leading-none">
                {priceObj.price}
              </div>
              <div className="text-[9px] font-black text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-widest mt-0.5">
                PER {priceObj.unit}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(listing)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] py-2 px-3 text-xs font-black transition-all cursor-pointer uppercase tracking-wider shadow-xs"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </button>

            {onCompareToggle && (
              <button
                onClick={() => onCompareToggle(listing)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isCompared
                    ? 'bg-[#FBBF24]/20 border-[#FBBF24] text-[#111111] dark:text-[#FBBF24]'
                    : 'bg-[#F7F7F5] dark:bg-[#111111] border-[#E5E5E5] dark:border-[#374151] text-[#6B7280] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white hover:border-[#FBBF24]'
                }`}
                title={isCompared ? 'Comparing' : 'Compare'}
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

