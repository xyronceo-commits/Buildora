import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  PhoneCall,
  Send,
  Bookmark,
  Scale,
  Navigation,
  Wrench,
  Package,
  Truck,
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
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-950 dark:text-white hover:text-amber-500 bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 hover:border-amber-400 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Search
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCompareToggle(listing)}
            className={`px-3 py-2 rounded-lg border text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 ${
              isCompared
                ? 'bg-[#FBBF24] border-[#FBBF24] text-zinc-950'
                : 'bg-white dark:bg-[#18181B] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-amber-400'
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
            className={`px-3 py-2 rounded-lg border text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 ${
              saved
                ? 'bg-[#FBBF24] text-zinc-950 border-[#FBBF24]'
                : 'bg-white dark:bg-[#18181B] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-amber-400'
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
          <div className="rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-3 space-y-3">
            <div className="relative h-72 sm:h-96 w-full rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-800">
              {selectedPhoto || (photos.length > 0 && photos[0]) ? (
                <img
                  src={selectedPhoto || photos[0]}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-400 p-4 text-center">
                  {listing.type === 'equipment' ? (
                    <Wrench className="h-16 w-16 text-zinc-400 mb-2" />
                  ) : listing.type === 'material' ? (
                    <Package className="h-16 w-16 text-zinc-400 mb-2" />
                  ) : (
                    <Truck className="h-16 w-16 text-zinc-400 mb-2" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    No photo uploaded
                  </span>
                </div>
              )}

              <div className="absolute top-4 left-4">
                {listing.availability.status === 'AVAILABLE' ? (
                  <span className="inline-flex items-center gap-1.5 bg-zinc-950/85 text-emerald-400 border border-emerald-500/30 text-xs font-black px-3 py-1 rounded uppercase tracking-wider backdrop-blur-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> AVAILABLE NOW
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-zinc-950/85 text-zinc-300 border border-zinc-700 text-xs font-black px-3 py-1 rounded uppercase tracking-wider backdrop-blur-xs">
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
                    className={`h-16 w-20 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                      (selectedPhoto || photos[0]) === photo
                        ? 'border-[#FBBF24] scale-102'
                        : 'border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Info Panel */}
          <div className="rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <span className="uppercase tracking-widest text-amber-700 dark:text-[#FBBF24] font-black">
                {listing.type.toUpperCase()} · {listing.category}
              </span>
              <span className="text-zinc-400 font-mono text-[11px]">ID: {listing.listingId}</span>
            </div>

            <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white leading-tight">
              {listing.title}
            </h1>

            <div className="flex items-baseline gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-3xl font-black font-mono text-zinc-950 dark:text-[#FBBF24]">{priceObj.price}</span>
              <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">
                PER {priceObj.unit}
              </span>
            </div>

            {listing.description && (
              <div className="pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Resource Description
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                  {listing.description}
                </p>
              </div>
            )}
          </div>

          {/* Specifications Table */}
          {listing.specifications && (
            <div className="rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
              <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-500" /> Technical Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(listing.specifications).map(([key, val]) => {
                  if (!val) return null;
                  const formattedKey = key.replace(/([A-Z])/g, ' $1').toUpperCase();
                  return (
                    <div
                      key={key}
                      className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 flex justify-between items-center"
                    >
                      <span className="text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
                        {formattedKey}
                      </span>
                      <span className="text-zinc-950 dark:text-white font-black">{String(val)}</span>
                    </div>
                  );
                })}

                {listing.brand && (
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[11px]">BRAND</span>
                    <span className="text-zinc-950 dark:text-white font-black">{listing.brand}</span>
                  </div>
                )}

                {listing.condition && (
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[11px]">CONDITION</span>
                    <span className="text-zinc-950 dark:text-white font-black">{listing.condition}</span>
                  </div>
                )}

                {listing.rental?.minimumPeriod && (
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[11px]">MINIMUM HIRE</span>
                    <span className="text-zinc-950 dark:text-white font-black">{listing.rental.minimumPeriod} DAYS</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Supplier Card & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
            <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">SUPPLIER DETAILS</span>
                <VerificationBadge status={listing.businessVerification} size="md" />
              </div>

              <button
                onClick={() => onViewBusiness(listing.businessId)}
                className="font-['Cabinet_Grotesk'] text-xl font-black text-zinc-950 dark:text-white hover:text-amber-500 text-left transition-colors cursor-pointer"
              >
                {listing.businessName}
              </button>

              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{distanceStr} from active project site</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-1">
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FBBF24] hover:bg-[#F59E0B] text-zinc-950 py-3.5 px-4 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" /> Request Formal Quote
              </button>

              {listing.contactPhone && (
                <button
                  onClick={handleCall}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-950 dark:text-white border border-zinc-200 dark:border-zinc-800 py-3 px-4 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <PhoneCall className="h-4 w-4 text-amber-500" /> Call Supplier ({listing.contactPhone})
                </button>
              )}

              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-white" /> WhatsApp Supplier
              </button>

              <button
                onClick={handleDirections}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-950 dark:text-white border border-zinc-200 dark:border-zinc-800 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
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
