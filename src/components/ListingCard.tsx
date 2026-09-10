import React from 'react';
import { MapPin, Bookmark, Scale, Eye, Wrench, Package, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
          <span className="inline-flex items-center gap-1 bg-orange-500 text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
            <Wrench className="h-3 w-3" /> EQUIPMENT
          </span>
        );
      case 'material':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-800 text-orange-400 border border-orange-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
            <Package className="h-3 w-3" /> MATERIAL
          </span>
        );
      case 'logistics':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-800 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
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
    return { price: 'CONTACT FOR PRICE', unit: '' };
  };

  const priceObj = getPriceDisplay();

  // Resource-specific specification chips
  const renderSpecChips = () => {
    const specs: string[] = [];
    if (listing.type === 'equipment') {
      if (listing.specifications?.operatingWeight) specs.push(listing.specifications.operatingWeight);
      if (listing.specifications?.enginePower) specs.push(listing.specifications.enginePower);
      if (listing.specifications?.bucketCapacity) specs.push(listing.specifications.bucketCapacity);
      if (listing.condition) specs.push(`${listing.condition} Condition`);
    } else if (listing.type === 'material') {
      if (listing.brand || listing.specifications?.brand) specs.push(listing.brand || listing.specifications?.brand || '');
      if (listing.specifications?.size) specs.push(listing.specifications.size);
      if (listing.specifications?.grade) specs.push(listing.specifications.grade);
      if (listing.unit) specs.push(`Per ${listing.unit}`);
    } else if (listing.type === 'logistics') {
      if (listing.specifications?.capacity) specs.push(`${listing.specifications.capacity} Capacity`);
      if (listing.specifications?.vehicleType) specs.push(listing.specifications.vehicleType);
      if (listing.specifications?.tripType) specs.push(listing.specifications.tripType);
    }

    const filtered = specs.filter(Boolean);
    if (filtered.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-semibold text-slate-300">
        {filtered.slice(0, 3).map((spec, idx) => (
          <span key={idx} className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
            {spec}
          </span>
        ))}
      </div>
    );
  };

  const hasPhoto = listing.photos && listing.photos.length > 0 && listing.photos[0];

  return (
    <div className="group relative rounded-2xl bg-[#111318] border border-slate-800 hover:border-orange-500/80 transition-all duration-200 flex flex-col overflow-hidden shadow-lg hover:shadow-orange-500/5">
      {/* Photo Banner */}
      <div className="relative h-48 sm:h-52 w-full bg-slate-900 overflow-hidden">
        {hasPhoto ? (
          <img
            src={listing.photos[0]}
            alt={listing.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 text-slate-600 gap-2 p-4 text-center">
            {listing.type === 'equipment' && <Wrench className="h-10 w-10 text-slate-700" />}
            {listing.type === 'material' && <Package className="h-10 w-10 text-slate-700" />}
            {listing.type === 'logistics' && <Truck className="h-10 w-10 text-slate-700" />}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">No Image Uploaded</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-transparent to-black/40" />

        {/* Type Badge Header */}
        <div className="absolute top-3 left-3 z-10">
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
          className={`absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer z-10 ${
            saved
              ? 'bg-orange-500 text-black font-extrabold shadow-md'
              : 'bg-black/70 text-slate-300 hover:text-orange-400 backdrop-blur-md border border-slate-700'
          }`}
          title={saved ? 'Saved' : 'Save to Binder'}
        >
          <Bookmark className="h-4 w-4" />
        </button>

        {/* Availability Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          {listing.availability.status === 'AVAILABLE' ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" /> AVAILABLE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-orange-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              {listing.availability.status}
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Supplier Name & Verification */}
          <div className="flex items-center justify-between text-xs text-slate-400 gap-2">
            <span className="truncate font-semibold uppercase tracking-wider text-slate-400 text-[11px]">
              {listing.businessName}
            </span>
            <VerificationBadge status={listing.businessVerification} size="sm" />
          </div>

          {/* Resource Title */}
          <h3 className="font-['Cabinet_Grotesk',sans-serif] text-base font-black text-white leading-snug group-hover:text-orange-400 transition-colors">
            {listing.title}
          </h3>

          {/* Resource Specification Chips */}
          {renderSpecChips()}
        </div>

        {/* Price & Location Footer */}
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <div
                className="flex items-center gap-1 text-slate-300 text-xs font-medium truncate"
                title={listing.location.address ? `${listing.location.address}, ${listing.location.city}` : `${listing.location.city}, ${listing.location.state}`}
              >
                <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                <span className="truncate font-semibold">
                  {listing.location.city}, {listing.location.state}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium pl-4">
                {distanceStr} from site
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-base sm:text-lg font-black text-orange-400 tracking-tight leading-none">
                {priceObj.price}
              </div>
              {priceObj.unit && (
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  / {priceObj.unit}
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onViewDetails(listing)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black py-2.5 px-3 text-xs font-black transition-all cursor-pointer uppercase tracking-wider"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </button>

            {onCompareToggle && (
              <button
                onClick={() => onCompareToggle(listing)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isCompared
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
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

