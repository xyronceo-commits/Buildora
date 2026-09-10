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
  MessageSquare,
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
  const [selectedPhoto, setSelectedPhoto] = useState(listing.photos?.[0] || '');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const saved = isSaved(listing.listingId);
  const distanceStr = formatDistance(activeProject.location, listing.location);

  const handleWhatsApp = () => {
    const phone = listing.contactPhone?.replace(/[^0-9]/g, '') || '';
    const text = encodeURIComponent(
      `Hello ${listing.businessName}, I am inquiring about "${listing.title}" (ID: ${listing.listingId}) listed on Constrora for my project near ${activeProject.location.city}.`
    );
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const handleCall = () => {
    if (listing.contactPhone) {
      window.location.href = `tel:${listing.contactPhone}`;
    }
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${listing.location.latitude},${listing.location.longitude}`;
    window.open(url, '_blank');
  };

  const getPriceDisplay = () => {
    if (listing.type === 'equipment' && listing.rental?.dailyPrice) {
      return { price: `₦${listing.rental.dailyPrice.toLocaleString()}`, unit: 'DAY' };
    }
    if (listing.price) {
      return { price: `₦${listing.price.toLocaleString()}`, unit: (listing.priceUnit || 'UNIT').toUpperCase() };
    }
    return { price: 'CONTACT FOR PRICE', unit: 'QUOTE' };
  };

  const priceObj = getPriceDisplay();
  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-300 hover:text-amber-500 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Search
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCompareToggle(listing)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isCompared
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>{isCompared ? 'Comparing' : 'Compare'}</span>
          </button>

          <button
            onClick={() =>
              toggleSave(
                listing.type === 'equipment' ? 'equipment' : listing.type === 'material' ? 'material' : 'logistics',
                listing.listingId
              )
            }
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              saved
                ? 'bg-amber-500 text-black border-amber-500 font-extrabold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Detail Info & Supplier Contact Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Gallery, Title, Specs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Photo Gallery Header */}
          <div className="rounded-3xl bg-[#121418] border border-slate-800 p-3 space-y-3 shadow-xl">
            <div className="relative h-72 sm:h-96 w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-800">
              {selectedPhoto || (photos.length > 0 && photos[0]) ? (
                <img
                  src={selectedPhoto || photos[0]}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 text-slate-600 p-4 text-center">
                  {listing.type === 'equipment' ? (
                    <Wrench className="h-16 w-16 text-slate-700 mb-2" />
                  ) : listing.type === 'material' ? (
                    <Package className="h-16 w-16 text-slate-700 mb-2" />
                  ) : (
                    <Truck className="h-16 w-16 text-slate-700 mb-2" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    No Photo Uploaded
                  </span>
                </div>
              )}

              <div className="absolute top-4 left-4">
                {listing.availability.status === 'AVAILABLE' ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-black text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow">
                    <span className="h-2 w-2 rounded-full bg-black animate-pulse" /> AVAILABLE NOW
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow">
                    {listing.availability.status}
                  </span>
                )}
              </div>
            </div>

            {photos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPhoto(photo)}
                    className={`h-16 w-20 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                      (selectedPhoto || photos[0]) === photo ? 'border-amber-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Info Panel */}
          <div className="rounded-3xl bg-[#121418] border border-slate-800 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-400">
              <span className="uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                {listing.type.toUpperCase()} • {listing.category}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">ID: {listing.listingId}</span>
            </div>

            <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-4xl font-black text-white leading-tight">
              {listing.title}
            </h1>

            <div className="flex items-baseline gap-2 pt-2 border-t border-slate-800">
              <span className="text-3xl font-black text-amber-400">{priceObj.price}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                PER {priceObj.unit}
              </span>
            </div>

            {listing.description && (
              <div className="pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                  Resource Description
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {listing.description}
                </p>
              </div>
            )}
          </div>

          {/* Specifications Table */}
          {listing.specifications && (
            <div className="rounded-3xl bg-[#121418] border border-slate-800 p-6 space-y-4">
              <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-500" /> Technical Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(listing.specifications).map(([key, val]) => {
                  if (!val) return null;
                  const formattedKey = key.replace(/([A-Z])/g, ' $1').toUpperCase();
                  return (
                    <div key={key} className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        {formattedKey}
                      </span>
                      <span className="text-white font-black">{String(val)}</span>
                    </div>
                  );
                })}

                {listing.brand && (
                  <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">BRAND</span>
                    <span className="text-white font-black">{listing.brand}</span>
                  </div>
                )}

                {listing.condition && (
                  <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">CONDITION</span>
                    <span className="text-white font-black">{listing.condition}</span>
                  </div>
                )}

                {listing.rental?.minimumPeriod && (
                  <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">MINIMUM HIRE</span>
                    <span className="text-white font-black">{listing.rental.minimumPeriod} DAYS</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Supplier Card & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-[#121418] border border-slate-800 p-6 space-y-5 shadow-xl">
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SUPPLIER DETAILS</span>
                <VerificationBadge status={listing.businessVerification} size="md" />
              </div>

              <button
                onClick={() => onViewBusiness(listing.businessId)}
                className="font-['Cabinet_Grotesk'] text-xl font-black text-white hover:text-amber-500 text-left transition-colors"
              >
                {listing.businessName}
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{distanceStr} from active project site</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-1">
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black py-3.5 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Send className="h-4 w-4" /> Request Formal Quote
              </button>

              {listing.contactPhone && (
                <button
                  onClick={handleCall}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 py-3 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  <PhoneCall className="h-4 w-4 text-emerald-400" /> Call Supplier ({listing.contactPhone})
                </button>
              )}

              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <MessageSquare className="h-4 w-4" /> WhatsApp Supplier
              </button>

              <button
                onClick={handleDirections}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Navigation className="h-4 w-4 text-amber-500" /> Directions to Yard
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
