import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Star,
  Clock,
  Building2,
  AlertTriangle,
  Send,
  Navigation,
  MessageSquare,
  Plus,
  CheckCircle2,
  HardHat,
} from 'lucide-react';
import { Business, Listing, Review, QuoteRequest } from '../types';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { formatDistance } from '../utils/distance';
import { VerificationBadge } from '../components/VerificationBadge';
import { ListingCard } from '../components/ListingCard';
import { QuoteModal } from '../components/QuoteModal';

interface BusinessDetailViewProps {
  business: Business;
  listings: Listing[];
  onBack: () => void;
  onSelectListing: (listing: Listing) => void;
  onCompareToggle: (listing: Listing) => void;
  comparedListings: Listing[];
}

export const BusinessDetailView: React.FC<BusinessDetailViewProps> = ({
  business,
  listings,
  onBack,
  onSelectListing,
  onCompareToggle,
  comparedListings,
}) => {
  const { activeProject } = useProject();
  const { currentUser } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([
    {
      reviewId: 'rev_1',
      businessId: business.businessId,
      userId: 'usr_1',
      userName: 'Engr. Tunde Bakare',
      rating: 5,
      comment: 'Extremely reliable heavy equipment supplier. CAT 320 excavator arrived at our site on time with a top operator.',
      status: 'visible',
      createdAt: '2026-08-15T10:00:00Z',
      updatedAt: '2026-08-15T10:00:00Z',
    },
    {
      reviewId: 'rev_2',
      businessId: business.businessId,
      userId: 'usr_2',
      userName: 'Chief K. Adeleke',
      rating: 5,
      comment: 'Prompt delivery of 9 inch vibrated blocks. Zero breakage.',
      status: 'visible',
      createdAt: '2026-08-20T14:30:00Z',
      updatedAt: '2026-08-20T14:30:00Z',
    },
  ]);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Wrong information');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const businessListings = listings.filter((l) => l.businessId === business.businessId);
  const distanceStr = formatDistance(activeProject.location, business.location);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const review: Review = {
      reviewId: `rev_${Date.now()}`,
      businessId: business.businessId,
      userId: currentUser?.uid || 'guest_user',
      userName: currentUser?.displayName || 'Constrora Contractor',
      rating: newRating,
      comment: newComment.trim(),
      status: 'visible',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReviews([review, ...reviews]);
    setNewComment('');
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportModal(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Supplier Profile Header Card */}
      <div className="rounded-3xl bg-[#121418] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                {business.category}
              </span>
              <VerificationBadge status={business.verificationStatus} size="sm" />
            </div>

            <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-4xl font-black text-white">
              {business.businessName}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>{business.rating}</span>
                <span className="text-slate-400 font-normal">({reviews.length} reviews)</span>
              </span>

              <span>·</span>

              <span className="flex items-center gap-1 text-slate-300 font-bold">
                <MapPin className="h-3.5 w-3.5 text-amber-500" />
                <span>{business.location.address ? `${business.location.address}, ${business.location.city}, ${business.location.state}` : `${business.location.city}, ${business.location.state}`}</span>
              </span>

              <span>·</span>

              <span className="text-slate-400 font-medium">
                📍 {distanceStr} from {activeProject.name}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Report Supplier
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{business.description}</p>

        {/* Business Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-amber-400 font-extrabold uppercase block">Supplier Physical Address</span>
            <span className="text-white font-semibold block mt-0.5">{business.location.address || 'Gbongan Road Industrial Zone'}, {business.location.city}, {business.location.state}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Opening Hours</span>
            <span className="text-white font-semibold block mt-0.5">{business.openingHours || 'Mon - Sat: 7am - 6pm'}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Area</span>
            <span className="text-white font-semibold block mt-0.5">{business.serviceArea || 'Statewide Delivery'}</span>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="flex items-center gap-2 bg-amber-500 text-black font-extrabold px-5 py-3 rounded-xl text-xs hover:bg-amber-400 cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <HardHat className="h-4 w-4" /> REQUEST DIRECT QUOTE
          </button>

          <button
            onClick={() => window.location.href = `tel:${business.phone}`}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-200 font-extrabold px-5 py-3 rounded-xl text-xs hover:border-slate-700 cursor-pointer"
          >
            <PhoneCall className="h-4 w-4 text-amber-500" /> CALL SUPPLIER
          </button>

          <button
            onClick={() => window.open(`https://wa.me/${business.whatsapp}?text=Hello%20${encodeURIComponent(business.businessName)}`, '_blank')}
            className="flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-extrabold px-5 py-3 rounded-xl text-xs hover:bg-emerald-600/30 cursor-pointer"
          >
            WhatsApp
          </button>

          <button
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${business.location.latitude},${business.location.longitude}`, '_blank')}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 font-bold px-4 py-3 rounded-xl text-xs hover:border-slate-700 cursor-pointer"
          >
            <Navigation className="h-4 w-4 text-amber-500" /> Directions
          </button>
        </div>
      </div>

      {/* Available Fleet & Inventory Section */}
      <div className="space-y-4">
        <h2 className="font-['Cabinet_Grotesk'] text-xl font-extrabold text-white">
          AVAILABLE LISTINGS ({businessListings.length})
        </h2>

        {businessListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessListings.map((item) => (
              <ListingCard
                key={item.listingId}
                listing={item}
                onViewDetails={onSelectListing}
                onCompareToggle={onCompareToggle}
                isCompared={comparedListings.some((c) => c.listingId === item.listingId)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#121418] border border-slate-800 p-8 text-center text-xs text-slate-400">
            No active listings currently displayed for this business.
          </div>
        )}
      </div>

      {/* Reviews & Ratings Section */}
      <div className="rounded-3xl bg-[#121418] border border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="font-['Cabinet_Grotesk'] text-xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-500" /> CUSTOMER REVIEWS ({reviews.length})
          </h2>
        </div>

        {/* Add Review Form */}
        <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-wider">Leave a Verified Review</div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewRating(star)}
                className="p-1 cursor-pointer"
              >
                <Star
                  className={`h-5 w-5 ${
                    star <= newRating ? 'fill-amber-500 text-amber-500' : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Describe your experience with this supplier's equipment or delivery..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
          />

          <button
            type="submit"
            className="bg-amber-500 text-black font-extrabold px-4 py-2 rounded-xl text-xs hover:bg-amber-400 transition-all cursor-pointer uppercase tracking-wider"
          >
            Post Review
          </button>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.reviewId} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{rev.userName}</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  ★ {rev.rating}
                </span>
              </div>
              <p className="text-slate-300">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#121418] border border-slate-800 p-6 space-y-4 text-white">
            <h3 className="font-bold text-lg text-red-400">REPORT BUSINESS PROFILE</h3>
            {!reportSuccess ? (
              <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Reason for Report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="Fake business">Fake business profile</option>
                    <option value="Wrong information">Wrong location or details</option>
                    <option value="Scam/fraud">Scam or suspicious conduct</option>
                    <option value="Closed business">Business permanently closed</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-2 text-xs">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <p>Report submitted to Constrora Admin moderation team.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        supplierBusinessId={business.businessId}
        supplierOwnerId={business.ownerId}
        businessName={business.businessName}
      />
    </div>
  );
};
