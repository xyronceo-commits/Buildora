import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, PhoneCall, MessageSquare, FileText, Calendar, MapPin, User, Mail, Box, HardHat } from 'lucide-react';
import { QuoteRequest } from '../types';

interface QuoteRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: QuoteRequest | null;
  onGenerateQuote: (request: QuoteRequest) => void;
}

export const QuoteRequestDetailModal: React.FC<QuoteRequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  onGenerateQuote,
}) => {
  if (!isOpen || !request) return null;

  const clientName = request.clientName || request.userName || 'Client';
  const clientPhone = request.clientPhone || request.userPhone || '';
  const clientEmail = request.clientEmail || '';
  const projectName = request.projectName || 'Construction Site';
  const projectLoc =
    typeof request.projectLocation === 'string'
      ? request.projectLocation
      : `${request.projectLocation?.address ? request.projectLocation.address + ', ' : ''}${request.projectLocation?.city || 'Osogbo'}, ${request.projectLocation?.state || 'Osun State'}`;

  // Format phone for WhatsApp
  let cleanPhone = clientPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '234' + cleanPhone.substring(1);
  }

  const waMessage = `Hello ${clientName}, I received your quote request for your ${projectName} project on CONSTRORA.`;
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#121418] border border-[#E5E5E5] dark:border-slate-800 p-6 sm:p-8 shadow-2xl text-[#111111] dark:text-white space-y-6"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#6B7280] hover:text-[#111111] dark:text-slate-400 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#E5E5E5] dark:border-slate-800 pb-4">
            <div className="h-10 w-10 rounded-2xl bg-[#FBBF24]/15 border border-[#FBBF24]/30 flex items-center justify-center text-[#B45309] dark:text-[#FBBF24]">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] bg-[#FBBF24] text-[#111111] font-black px-2 py-0.5 rounded uppercase">
                QUOTE REQUEST
              </span>
              <h2 className="font-['Cabinet_Grotesk'] text-xl font-black text-[#111111] dark:text-white mt-1">
                {projectName}
              </h2>
            </div>
          </div>

          {/* Client & Metadata Box */}
          <div className="p-4 bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[#6B7280] dark:text-slate-400 block text-[10px] font-bold uppercase">Client Name</span>
                <span className="font-extrabold text-[#111111] dark:text-white text-sm flex items-center gap-1.5 mt-0.5">
                  <User className="h-4 w-4 text-[#F59E0B]" /> {clientName}
                </span>
              </div>

              <div>
                <span className="text-[#6B7280] dark:text-slate-400 block text-[10px] font-bold uppercase">Required Date</span>
                <span className="font-bold text-[#B45309] dark:text-[#FBBF24] text-xs flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-4 w-4 text-[#F59E0B]" /> {request.requiredDate || 'As soon as possible'}
                </span>
              </div>

              <div>
                <span className="text-[#6B7280] dark:text-slate-400 block text-[10px] font-bold uppercase">Phone Number</span>
                <span className="font-semibold text-[#111111] dark:text-slate-200 text-xs flex items-center gap-1.5 mt-0.5">
                  <PhoneCall className="h-3.5 w-3.5 text-[#6B7280] dark:text-slate-400" /> {clientPhone || 'Not provided'}
                </span>
              </div>

              {clientEmail && (
                <div>
                  <span className="text-[#6B7280] dark:text-slate-400 block text-[10px] font-bold uppercase">Email</span>
                  <span className="font-semibold text-[#111111] dark:text-slate-200 text-xs flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3.5 w-3.5 text-[#6B7280] dark:text-slate-400" /> {clientEmail}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-[#E5E5E5] dark:border-slate-800 pt-2.5">
              <span className="text-[#6B7280] dark:text-slate-400 block text-[10px] font-bold uppercase">Project Location</span>
              <span className="font-bold text-[#111111] dark:text-slate-200 text-xs flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-4 w-4 text-[#F59E0B] shrink-0" /> {projectLoc}
              </span>
            </div>
          </div>

          {/* Requested Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-[#B45309] dark:text-[#FBBF24] uppercase tracking-wider flex items-center gap-1.5">
              <Box className="h-4 w-4" /> REQUESTED ITEMS
            </h3>
            <div className="p-4 bg-white dark:bg-slate-950 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl space-y-2 shadow-2xs">
              {request.items && request.items.length > 0 ? (
                request.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-bold text-[#111111] dark:text-white border-b border-slate-100 dark:border-slate-900 pb-1.5 last:border-none last:pb-0">
                    <span>{it.name}</span>
                    <span className="bg-[#FBBF24]/15 text-[#B45309] dark:text-[#FBBF24] border border-[#FBBF24]/30 px-2 py-0.5 rounded font-mono font-bold">
                      {it.quantity} {it.unit}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between items-center text-xs font-bold text-[#111111] dark:text-white">
                  <span>{request.itemName || request.listingTitle || 'Construction Resource'}</span>
                  <span className="bg-[#FBBF24]/15 text-[#B45309] dark:text-[#FBBF24] border border-[#FBBF24]/30 px-2 py-0.5 rounded font-mono font-bold">
                    {request.quantity}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Client Message */}
          {request.message && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-black text-[#6B7280] dark:text-slate-400 uppercase tracking-wider">CLIENT MESSAGE</h3>
              <div className="p-3.5 bg-[#F7F7F5] dark:bg-slate-900/90 border border-[#E5E5E5] dark:border-slate-800 rounded-xl text-[#374151] dark:text-slate-300 italic text-xs leading-relaxed">
                "{request.message}"
              </div>
            </div>
          )}

          {/* Supplier Action Buttons (Section 7) */}
          <div className="border-t border-[#E5E5E5] dark:border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <a
              href={clientPhone ? `tel:${clientPhone}` : '#'}
              className={`px-4 py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center ${
                clientPhone
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#111111] dark:text-white cursor-pointer'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <PhoneCall className="h-4 w-4 text-[#F59E0B]" />
              <span>CALL CLIENT</span>
            </a>

            <a
              href={clientPhone ? waUrl : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center ${
                clientPhone
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>CHAT ON WHATSAPP</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onClose();
                onGenerateQuote(request);
              }}
              className="px-4 py-3 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black text-xs rounded-2xl transition-all cursor-pointer shadow-sm uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <FileText className="h-4 w-4" />
              <span>GENERATE QUOTE</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
