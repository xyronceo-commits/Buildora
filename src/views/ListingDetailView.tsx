import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  PhoneCall,
  Send,
  Bookmark,
  Scale,
  Navigation,
  ShieldCheck,
  Check,
  Wrench,
  Package,
  Truck,
  Building2,
  Calendar,
  AlertCircle,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { Listing, QuoteRequest } from '../types';
import { useProject } from '../context/ProjectContext';
import { useSaved } from '../context/SavedContext';
import { formatDistance } from '../utils/distance';
import { VerificationBadge } from '../components/VerificationBadge';
import { QuoteModal } from '../components/QuoteModal';

interface ListingDetailViewProps {
  listing: Listing;
  onBack: () => void;
  onViewBusiness: (businessId: string) => void;
  onCompareToggle: (listing: Listing) => void;
  isCompared: boolean;
  onQuoteSent?: (quote: QuoteRequest) => void;
}

export const ListingDetailView: React.FC<ListingDetailViewProps> = ({
  listing,
  onBack,
  onViewBusiness,
  onCompareToggle,
  isCompared,
  onQuoteSent,
}) => {
  const { activeProject } = useProject();
  const { isSaved, toggleSave } = useSaved();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const saved = isSaved(listing.listingId);
  const distanceStr = formatDistance(activeProject.location, listing.location);

  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : [];
  const activePhoto = photos[selectedPhotoIndex] || '';

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello! I am inquiring about "${listing.title}" on Constrora for our site in ${activeProject.location.city}. Is this available?`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:+2348034567890`;
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${listing.location.latitude},${listing.location.longitude}`;
    window.open(url, '_blank');
  };

  const getPriceDisplay = () => {
    if (listing.type === 'equipment' && listing.rental?.dailyPrice) {
      return `₦${listing.rental.dailyPrice.toLocaleString()} / day`;
    }
    if (listing.price) {
      return `₦${listing.price.toLocaleString()} / ${(listing.priceUnit || 'unit').toLowerCase()}`;
    }
    return 'Contact for Price';
  };

  // Build clean non-empty specs array
  const renderFormattedSpecs = () => {
    const specsMap: { label: string; value: string }[] = [];

    if (listing.type === 'equipment') {
      if (listing.specifications?.operatingWeight) specsMap.push({ label: 'Operating Weight', value: listing.specifications.operatingWeight });
      if (listing.specifications?.enginePower) specsMap.push({ label: 'Engine Power', value: listing.specifications.enginePower });
      if (listing.specifications?.bucketCapacity) specsMap.push({ label: 'Bucket Capacity', value: listing.specifications.bucketCapacity });
      if (listing.specifications?.maxDiggingDepth) specsMap.push({ label: 'Max Digging Depth', value: listing.specifications.maxDiggingDepth });
      if (listing.specifications?.fuelType) specsMap.push({ label: 'Fuel Type', value: listing.specifications.fuelType });
      if (listing.condition) specsMap.push({ label: 'Equipment Condition', value: listing.condition });
      if (listing.brand || listing.manufacturer) specsMap.push({ label: 'Brand / Make', value: listing.brand || listing.manufacturer || '' });
      if (listing.model) specsMap.push({ label: 'Model Number', value: listing.model });
    } else if (listing.type === 'material') {
      if (listing.brand || listing.specifications?.brand) specsMap.push({ label: 'Brand / Manufacturer', value: listing.brand || listing.specifications?.brand || '' });
      if (listing.specifications?.size) specsMap.push({ label: 'Unit Size / Packaging', value: listing.specifications.size });
      if (listing.specifications?.grade) specsMap.push({ label: 'Grade / Class', value: listing.specifications.grade });
      if (listing.unit) specsMap.push({ label: 'Pricing Unit', value: listing.unit });
      if (listing.condition) specsMap.push({ label: 'Material Quality', value: listing.condition });
    } else if (listing.type === 'logistics') {
      if (listing.specifications?.capacity) specsMap.push({ label: 'Payload Capacity', value: listing.specifications.capacity });
      if (listing.specifications?.vehicleType) specsMap.push({ label: 'Vehicle / Vessel Type', value: listing.specifications.vehicleType });
      if (listing.specifications?.tripType) specsMap.push({ label: 'Service Scope', value: listing.specifications.tripType });
      if (listing.delivery?.serviceArea) specsMap.push({ label: 'Operational Coverage', value: listing.delivery.serviceArea });
    }

    // Catch remaining specs in specifications object if not caught above
    if (listing.specifications) {
      Object.entries(listing.specifications).forEach(([k, v]) => {
        if (v && !specsMap.some((s) => s.label.toLowerCase() === k.toLowerCase())) {
          const formattedLabel = k.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
          specsMap.push({ label: formattedLabel, value: String(v) });
        }
      });
    }

    if (specsMap.length === 0) return null;

    return (
      <div className="rounded-2xl bg-[#111318] border border-slate-800 p-5 space-y-4">
        <h3 className="font-['Cabinet_Grotesk',sans-serif] text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Wrench className="h-4 w-4 text-orange-500" /> TECHNICAL SPECIFICATIONS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {specsMap.map((item, idx) => (
            <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">
                {item.label}
              </span>
              <span className="font-bold text-white mt-0.5 block">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-orange-500" /> Back to Search
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCompareToggle(listing)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isCompared
                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">{isCompared ? 'Comparing' : 'Compare'}</span>
          </button>

          <button
            onClick={() =>
              toggleSave(
                listing.type === 'equipment' ? 'equipment' : listing.type === 'material' ? 'material' : 'logistics',
                listing.listingId
              )
            }
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              saved
                ? 'bg-orange-500 text-black border-orange-500'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title={saved ? 'Saved' : 'Save Resource'}
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Photo Gallery Header */}
      <div className="space-y-3">
        <div className="relative h-72 sm:h-96 w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shadow-2xl">
          {activePhoto ? (
            <img
              src={activePhoto}
              alt={listing.title}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 text-slate-600 gap-2 p-6 text-center">
              {listing.type === 'equipment' && <Wrench className="h-16 w-16 text-slate-700" />}
              {listing.type === 'material' && <Package className="h-16 w-16 text-slate-700" />}
              {listing.type === 'logistics' && <Truck className="h-16 w-16 text-slate-700" />}
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                No Supplier Photo Available
              </span>
            </div>
          )}

          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase text-orange-400 border border-slate-700">
            {listing.type}
          </div>
        </div>

        {photos.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setSelectedPhotoIndex(i)}
                className={`h-16 w-20 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                  selectedPhotoIndex === i ? 'border-orange-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={photo} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Title, Specs, Description */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-3">
            {/* Supplier header */}
            <button
              onClick={() => onViewBusiness(listing.businessId)}
              className="text-xs font-bold text-slate-300 hover:text-orange-400 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="h-4 w-4 text-orange-500" />
              <span>{listing.businessName}</span>
              <VerificationBadge status={listing.businessVerification} size="sm" />
            </button>

            {/* Title */}
            <h1 className="font-['Cabinet_Grotesk',sans-serif] text-2xl sm:text-3xl font-black text-white leading-tight">
              {listing.title}
            </h1>

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-200 font-semibold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                <span>
                  {listing.location.city}, {listing.location.state}
                </span>
              </span>

              <span className="flex items-center gap-1 text-orange-400 font-semibold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                📍 {distanceStr} from site
              </span>

              {listing.availability.status === 'AVAILABLE' ? (
                <span className="bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1.5 rounded-xl border border-emerald-500/20 uppercase tracking-wider text-[11px]">
                  ✓ AVAILABLE NOW
                </span>
              ) : (
                <span className="bg-orange-500/10 text-orange-400 font-bold px-3 py-1.5 rounded-xl border border-orange-500/20 uppercase tracking-wider text-[11px]">
                  {listing.availability.status}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="rounded-2xl bg-[#111318] border border-slate-800 p-5 space-y-2 text-xs text-slate-300 leading-relaxed">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">RESOURCE OVERVIEW</h3>
              <p className="font-medium text-slate-300">{listing.description}</p>
            </div>
          )}

          {/* Formatted Technical Specifications */}
          {renderFormattedSpecs()}
        </div>

        {/* Right Column: Pricing & Action Controls */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#111318] border border-orange-500/40 p-5 space-y-4 shadow-xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">PRICING & TERMS</div>

            <div className="font-['Cabinet_Grotesk',sans-serif] text-2xl sm:text-3xl font-black text-orange-400">
              {getPriceDisplay()}
            </div>

            {listing.rental && (
              <div className="space-y-2 text-xs border-t border-slate-800 pt-3 text-slate-300 font-medium">
                {listing.rental.weeklyPrice && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Weekly Rate:</span>
                    <span className="font-bold text-white">₦{listing.rental.weeklyPrice.toLocaleString()}</span>
                  </div>
                )}
                {listing.rental.monthlyPrice && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Rate:</span>
                    <span className="font-bold text-white">₦{listing.rental.monthlyPrice.toLocaleString()}</span>
                  </div>
                )}
                {listing.rental.operatorIncluded && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Operator:</span>
                    <span className="font-bold text-emerald-400">✓ {listing.rental.operatorIncluded}</span>
                  </div>
                )}
                {listing.rental.fuelIncluded && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fuel Status:</span>
                    <span className="font-bold text-slate-200">{listing.rental.fuelIncluded}</span>
                  </div>
                )}
              </div>
            )}

            {/* Supplier Yard Address */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-orange-400 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <MapPin className="h-3.5 w-3.5 text-orange-500" /> Supplier Depot Location
              </div>
              <div className="text-white font-bold text-xs">
                {listing.location.address
                  ? `${listing.location.address}, ${listing.location.city}, ${listing.location.state}`
                  : `${listing.location.city}, ${listing.location.state}`}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Distance: {distanceStr} ({activeProject.name})
              </div>
            </div>

            {/* Delivery Info */}
            {listing.delivery && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{listing.delivery.available ? 'Site Delivery Available' : 'Supplier Depot Pickup'}</span>
                </div>
                {listing.delivery.serviceArea && (
                  <div className="text-[11px] text-slate-400">Service Area: {listing.delivery.serviceArea}</div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black py-3 text-xs transition-all cursor-pointer shadow-lg shadow-orange-500/20 uppercase tracking-wider"
              >
                <Send className="h-4 w-4" /> REQUEST QUOTE
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCall}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold py-2.5 text-xs hover:border-slate-700 cursor-pointer"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-orange-500" /> CALL
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold py-2.5 text-xs hover:bg-emerald-600/30 cursor-pointer"
                >
                  WhatsApp
                </button>
              </div>

              <button
                onClick={handleDirections}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold py-2 text-xs hover:border-slate-700 cursor-pointer"
              >
                <Navigation className="h-3.5 w-3.5 text-orange-500" /> Get GPS Directions
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        listing={listing}
        onQuoteSent={onQuoteSent}
      />
    </div>
  );
};

