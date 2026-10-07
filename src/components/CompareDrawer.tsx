import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Scale, MapPin, Send, Trash2 } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex flex-col bg-white/98 dark:bg-[#111111]/98 backdrop-blur-md text-zinc-950 dark:text-white p-4 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#FBBF24]/20 text-amber-600 dark:text-[#FBBF24] border border-[#FBBF24]/40 flex items-center justify-center">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-zinc-950 dark:text-white uppercase tracking-tight">
                RESOURCE COMPARISON ({listings.length}/4)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Evaluating options near <strong className="text-amber-600 dark:text-[#FBBF24]">{activeProject.name} · {activeProject.location.city}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            aria-label="Close comparison"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comparison Table Grid */}
        <div className="flex-1 overflow-x-auto py-6">
          <div className="min-w-[700px] grid grid-cols-5 gap-4">
            {/* Row Labels Column */}
            <div className="space-y-6 text-xs font-bold text-zinc-500 uppercase tracking-wider pt-28">
              <div className="h-8 flex items-center">Pricing</div>
              <div className="h-8 flex items-center">Distance from Site</div>
              <div className="h-8 flex items-center">Supplier & Status</div>
              <div className="h-8 flex items-center">Availability</div>
              <div className="h-8 flex items-center">Condition / Grade</div>
              <div className="h-8 flex items-center">Operator / Crew</div>
              <div className="h-8 flex items-center">Haulage & Delivery</div>
              <div className="h-12 flex items-center">Direct Action</div>
            </div>

            {/* Listing Columns */}
            {listings.map((item) => {
              const distanceStr = formatDistance(activeProject.location, item.location);
              return (
                <div
                  key={item.listingId}
                  className="rounded-xl bg-zinc-50 dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-4 space-y-6 flex flex-col justify-between"
                >
                  {/* Top Item Card Header */}
                  <div className="space-y-2 relative">
                    <button
                      onClick={() => onRemove(item.listingId)}
                      className="absolute -top-1 -right-1 text-zinc-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                      title="Remove from comparison"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="h-20 w-full rounded-lg bg-zinc-200 dark:bg-zinc-900 overflow-hidden">
                      {item.photos && item.photos[0] ? (
                        <img
                          src={item.photos[0]}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-zinc-400 text-xs font-bold">
                          No Photo
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-zinc-950 dark:text-white line-clamp-2">{item.title}</h4>
                  </div>

                  {/* Pricing */}
                  <div className="h-8 flex items-center font-mono text-sm font-black text-amber-600 dark:text-[#FBBF24]">
                    {item.rental?.dailyPrice
                      ? `₦${item.rental.dailyPrice.toLocaleString()} / day`
                      : item.price
                      ? `₦${item.price.toLocaleString()} / ${item.priceUnit}`
                      : 'Contact for Price'}
                  </div>

                  {/* Distance */}
                  <div className="h-8 flex items-center text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-amber-500 mr-1 shrink-0" />
                    <span>{distanceStr}</span>
                  </div>

                  {/* Supplier */}
                  <div className="h-8 flex items-center text-xs">
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-white truncate">{item.businessName}</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {item.businessVerification === 'VERIFIED' ? '✓ VERIFIED SUPPLIER' : 'REGISTERED'}
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="h-8 flex items-center">
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded uppercase">
                      {item.availability.status}
                    </span>
                  </div>

                  {/* Condition */}
                  <div className="h-8 flex items-center text-xs text-zinc-700 dark:text-zinc-300">
                    {item.condition || item.brand || 'Standard'}
                  </div>

                  {/* Operator */}
                  <div className="h-8 flex items-center text-xs text-zinc-700 dark:text-zinc-300">
                    {item.rental?.operatorIncluded || 'Included'}
                  </div>

                  {/* Fuel / Delivery */}
                  <div className="h-8 flex items-center text-xs text-zinc-700 dark:text-zinc-300">
                    {item.delivery?.available ? `Delivery Available` : 'Site Pickup'}
                  </div>

                  {/* Action */}
                  <div className="h-12 flex items-center pt-2">
                    <button
                      onClick={() => onRequestQuote(item)}
                      className="w-full flex items-center justify-center gap-1.5 bg-[#FBBF24] hover:bg-[#F59E0B] text-zinc-950 font-black py-2.5 px-3 text-xs rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      <Send className="h-3.5 w-3.5" /> Request Quote
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
