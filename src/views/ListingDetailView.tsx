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
  const [selectedPhoto, setSelectedPhoto] = useState(listing.photos[0] || '');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const saved = isSaved(listing.listingId);
  const distanceStr = formatDistance(activeProject.location, listing.location);

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Search
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCompareToggle(listing)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              isCompared
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">{isCompared ? 'Comparing' : 'Compare'}</span>
          </button>

          <button
            onClick={() => toggleSave(listing.type === 'equipment' ? 'equipment' : listing.type === 'material' ? 'material' : 'logistics', listing.listingId)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              saved
                ? 'bg-amber-500 text-black border-amber-500'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Photo Gallery Header */}
      <div className="space-y-3">
        <div className="relative h-72 sm:h-96 w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shadow-2xl">
          <img
            src={selectedPhoto}
            alt={listing.title}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-extrabold uppercase text-amber-400 border border-slate-700">
            {listing.type}
          </div>
        </div>

        {listing.photos.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {listing.photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setSelectedPhoto(photo)}
                className={`h-16 w-20 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                  selectedPhoto === photo ? 'border-amber-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={photo} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Detail Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Title, Specs, Inclusions */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onViewBusiness(listing.businessId)}
                className="text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-2"
              >
                <Building2 className="h-4 w-4 text-amber-500" />
                <span>{listing.businessName}</span>
                <VerificationBadge status={listing.businessVerification} size="sm" />
              </button>
            </div>

            <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white leading-tight">
              {listing.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 text-slate-200 font-bold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Supplier Address: <strong className="text-white">{listing.location.address ? `${listing.location.address}, ${listing.location.city}, ${listing.location.state}` : `${listing.location.city}, ${listing.location.state}`}</strong></span>
              </span>

              <span className="flex items-center gap-1 text-amber-400 font-semibold bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl">
                📍 {distanceStr} from {activeProject.name}
              </span>

              {listing.condition && (
                <span className="bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-slate-300 font-medium">
                  Condition: <strong className="text-white">{listing.condition}</strong>
                </span>
              )}

              <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
                {listing.availability.status}
              </span>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="rounded-2xl bg-[#121418] border border-slate-800 p-5 space-y-2 text-xs text-slate-300 leading-relaxed">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">RESOURCE DESCRIPTION</h3>
              <p>{listing.description}</p>
            </div>
          )}

          {/* Specifications Table */}
          {listing.specifications && (
            <div className="rounded-2xl bg-[#121418] border border-slate-800 p-5 space-y-3">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Wrench className="h-4 w-4 text-amber-500" /> TECHNICAL SPECIFICATIONS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(listing.specifications).map(([key, val]) => (
                  <div key={key} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="font-bold text-slate-200 mt-0.5 block">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing Card & Contact Actions */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#121418] border border-amber-500/40 p-5 space-y-4 shadow-xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing & Terms</div>

            <div className="font-['Cabinet_Grotesk'] text-2xl font-black text-amber-400">
              {listing.rental?.dailyPrice
                ? `₦${listing.rental.dailyPrice.toLocaleString()} / day`
                : listing.price
                ? `₦${listing.price.toLocaleString()} / ${listing.priceUnit}`
                : 'Contact for Price'}
            </div>

            {listing.rental && (
              <div className="space-y-2 text-xs border-t border-slate-800 pt-3 text-slate-300">
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
                    <span className="text-slate-400">Certified Operator:</span>
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
              <div className="font-extrabold text-amber-400 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <MapPin className="h-3.5 w-3.5 text-amber-500" /> Supplier Yard Address
              </div>
              <div className="text-white font-bold text-xs">
                {listing.location.address ? `${listing.location.address}, ${listing.location.city}, ${listing.location.state}` : `${listing.location.city}, ${listing.location.state}`}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">
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

            {/* Contact Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-black font-black py-3 text-xs hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/20 uppercase tracking-wider"
              >
                <Send className="h-4 w-4" /> REQUEST QUOTE
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCall}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold py-2.5 text-xs hover:border-slate-700 cursor-pointer"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-amber-500" /> CALL
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
                <Navigation className="h-3.5 w-3.5 text-amber-500" /> Get GPS Site Directions
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
