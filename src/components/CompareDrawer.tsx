import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Scale, MapPin, ShieldCheck, Check, PhoneCall, Send, Trash2 } from 'lucide-react';
import { Listing } from '../types';
import { useProject } from '../context/ProjectContext';
import { formatDistance } from '../utils/distance';

interface CompareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  onRemove: (listingId: string) => void;
  onRequestQuote: (listing: Listing) => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  isOpen,
  onClose,
  listings,
  onRemove,
  onRequestQuote,
}) => {
  const { activeProject } = useProject();

  if (!isOpen || listings.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-white/95 dark:bg-black/90 backdrop-blur-md text-[#111111] dark:text-white p-4 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#FBBF24]/15 text-[#B45309] dark:text-[#FBBF24] border border-[#FBBF24]/30 flex items-center justify-center">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-['Cabinet_Grotesk'] text-lg font-extrabold text-[#111111] dark:text-white">
                RESOURCE COMPARISON ({listings.length}/4)
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-slate-400">
                Comparing around <span className="text-[#B45309] dark:text-[#FBBF24] font-bold">{activeProject.name} · {activeProject.location.city}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F7F7F5] dark:bg-slate-900 text-[#6B7280] hover:text-[#111111] dark:text-slate-400 dark:hover:text-white border border-[#E5E5E5] dark:border-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comparison Table Grid */}
        <div className="flex-1 overflow-x-auto py-6">
          <div className="min-w-[600px] grid grid-cols-5 gap-4">
            {/* Row Labels Column */}
            <div className="space-y-6 text-xs font-bold text-[#6B7280] dark:text-slate-400 pt-32">
              <div className="h-8 flex items-center">Pricing</div>
              <div className="h-8 flex items-center">Distance</div>
              <div className="h-8 flex items-center">Supplier & Verification</div>
              <div className="h-8 flex items-center">Availability</div>
              <div className="h-8 flex items-center">Condition / Grade</div>
              <div className="h-8 flex items-center">Operator / Driver</div>
              <div className="h-8 flex items-center">Fuel / Delivery</div>
              <div className="h-12 flex items-center">Actions</div>
            </div>

            {/* Listing Columns */}
            {listings.map((item) => {
              const distanceStr = formatDistance(activeProject.location, item.location);
              return (
                <div
                  key={item.listingId}
                  className="rounded-2xl bg-[#F7F7F5] dark:bg-[#121418] border border-[#E5E5E5] dark:border-slate-800 p-4 space-y-6 flex flex-col justify-between shadow-2xs"
                >
                  {/* Top Item Card Header */}
                  <div className="space-y-2 relative">
                    <button
                      onClick={() => onRemove(item.listingId)}
                      className="absolute -top-1 -right-1 text-[#6B7280] hover:text-red-500 p-1 cursor-pointer"
                      title="Remove from compare"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="h-20 w-full rounded-xl bg-slate-200 dark:bg-slate-900 overflow-hidden">
                      <img
                        src={item.photos[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h4 className="font-bold text-xs text-[#111111] dark:text-white line-clamp-2">{item.title}</h4>
                  </div>

                  {/* Pricing */}
                  <div className="h-8 flex items-center font-['Cabinet_Grotesk'] text-sm font-extrabold text-[#B45309] dark:text-[#FBBF24]">
                    {item.rental?.dailyPrice ? `₦${item.rental.dailyPrice.toLocaleString()} / day` : item.price ? `₦${item.price.toLocaleString()} / ${item.priceUnit}` : 'Contact for Price'}
                  </div>

                  {/* Distance */}
                  <div className="h-8 flex items-center text-xs text-[#374151] dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-[#F59E0B] mr-1" />
                    <span>{distanceStr}</span>
                  </div>

                  {/* Supplier */}
                  <div className="h-8 flex items-center text-xs text-[#111111] dark:text-slate-200">
                    <div>
                      <div className="font-bold truncate">{item.businessName}</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {item.businessVerification === 'VERIFIED' ? '✓ VERIFIED' : 'LISTED'}
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="h-8 flex items-center">
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded">
                      {item.availability.status}
                    </span>
                  </div>

                  {/* Condition */}
                  <div className="h-8 flex items-center text-xs text-[#374151] dark:text-slate-300">
                    {item.condition || item.brand || 'Good'}
                  </div>

                  {/* Operator */}
                  <div className="h-8 flex items-center text-xs text-[#374151] dark:text-slate-300">
                    {item.rental?.operatorIncluded || 'Included'}
                  </div>

                  {/* Fuel / Delivery */}
                  <div className="h-8 flex items-center text-xs text-[#374151] dark:text-slate-300">
                    {item.delivery?.available ? `Delivery Available` : 'Pickup'}
                  </div>

                  {/* Action */}
                  <div className="h-12 flex items-center pt-2">
                    <button
                      onClick={() => onRequestQuote(item)}
                      className="w-full flex items-center justify-center gap-1 bg-[#FBBF24] text-[#111111] font-black py-2 px-3 text-xs rounded-xl hover:bg-[#F59E0B] cursor-pointer shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" /> QUOTE
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
