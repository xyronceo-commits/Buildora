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
      <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md text-white p-4 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-['Cabinet_Grotesk'] text-lg font-extrabold text-white">
                RESOURCE COMPARISON ({listings.length}/4)
              </h3>
              <p className="text-xs text-slate-400">
                Comparing around <span className="text-amber-400">{activeProject.name} · {activeProject.location.city}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comparison Table Grid */}
        <div className="flex-1 overflow-x-auto py-6">
          <div className="min-w-[600px] grid grid-cols-5 gap-4">
            {/* Row Labels Column */}
            <div className="space-y-6 text-xs font-bold text-slate-400 pt-32">
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
                  className="rounded-2xl bg-[#121418] border border-slate-800 p-4 space-y-6 flex flex-col justify-between"
                >
                  {/* Top Item Card Header */}
                  <div className="space-y-2 relative">
                    <button
                      onClick={() => onRemove(item.listingId)}
                      className="absolute -top-1 -right-1 text-slate-500 hover:text-red-400 p-1"
                      title="Remove from compare"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="h-20 w-full rounded-xl bg-slate-900 overflow-hidden">
                      <img
                        src={item.photos[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h4 className="font-bold text-xs text-white line-clamp-2">{item.title}</h4>
                  </div>

                  {/* Pricing */}
                  <div className="h-8 flex items-center font-['Cabinet_Grotesk'] text-sm font-extrabold text-amber-400">
                    {item.rental?.dailyPrice ? `₦${item.rental.dailyPrice.toLocaleString()} / day` : item.price ? `₦${item.price.toLocaleString()} / ${item.priceUnit}` : 'Contact for Price'}
                  </div>

                  {/* Distance */}
                  <div className="h-8 flex items-center text-xs text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-amber-500 mr-1" />
                    <span>{distanceStr}</span>
                  </div>

                  {/* Supplier */}
                  <div className="h-8 flex items-center text-xs text-slate-200">
                    <div>
                      <div className="font-bold truncate">{item.businessName}</div>
                      <div className="text-[10px] text-emerald-400">
                        {item.businessVerification === 'VERIFIED' ? '✓ VERIFIED' : 'LISTED'}
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="h-8 flex items-center">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                      {item.availability.status}
                    </span>
                  </div>

                  {/* Condition */}
                  <div className="h-8 flex items-center text-xs text-slate-300">
                    {item.condition || item.brand || 'Good'}
                  </div>

                  {/* Operator */}
                  <div className="h-8 flex items-center text-xs text-slate-300">
                    {item.rental?.operatorIncluded || 'Included'}
                  </div>

                  {/* Fuel / Delivery */}
                  <div className="h-8 flex items-center text-xs text-slate-300">
                    {item.delivery?.available ? `Delivery Available` : 'Pickup'}
                  </div>

                  {/* Action */}
                  <div className="h-12 flex items-center pt-2">
                    <button
                      onClick={() => onRequestQuote(item)}
                      className="w-full flex items-center justify-center gap-1 bg-amber-500 text-black font-extrabold py-2 px-3 text-xs rounded-xl hover:bg-amber-400"
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
