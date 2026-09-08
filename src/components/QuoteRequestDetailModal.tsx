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
          className="relative w-full max-w-xl rounded-3xl bg-[#121418] border border-slate-800 p-6 sm:p-8 shadow-2xl text-white space-y-6"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] bg-amber-500 text-black font-extrabold px-2 py-0.5 rounded uppercase">
                QUOTE REQUEST
              </span>
              <h2 className="font-['Cabinet_Grotesk'] text-xl font-black text-white mt-1">
                {projectName}
              </h2>
            </div>
          </div>

          {/* Client & Metadata Box */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Client Name</span>
                <span className="font-extrabold text-white text-sm flex items-center gap-1.5 mt-0.5">
                  <User className="h-4 w-4 text-amber-400" /> {clientName}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Required Date</span>
                <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-4 w-4 text-amber-400" /> {request.requiredDate || 'As soon as possible'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Phone Number</span>
                <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5 mt-0.5">
                  <PhoneCall className="h-3.5 w-3.5 text-slate-400" /> {clientPhone || 'Not provided'}
                </span>
              </div>

              {clientEmail && (
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Email</span>
                  <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> {clientEmail}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-2.5">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Project Location</span>
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0" /> {projectLoc}
              </span>
            </div>
          </div>

          {/* Requested Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <Box className="h-4 w-4" /> REQUESTED ITEMS
            </h3>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              {request.items && request.items.length > 0 ? (
                request.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-bold text-white border-b border-slate-900 pb-1.5 last:border-none last:pb-0">
                    <span>{it.name}</span>
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                      {it.quantity} {it.unit}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between items-center text-xs font-bold text-white">
                  <span>{request.itemName || request.listingTitle || 'Construction Resource'}</span>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                    {request.quantity}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Client Message */}
          {request.message && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">CLIENT MESSAGE</h3>
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-300 italic text-xs leading-relaxed">
                "{request.message}"
              </div>
            </div>
          )}

          {/* Supplier Action Buttons (Section 7) */}
          <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <a
              href={clientPhone ? `tel:${clientPhone}` : '#'}
              className={`px-4 py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center ${
                clientPhone
                  ? 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
              }`}
            >
              <PhoneCall className="h-4 w-4 text-amber-400" />
              <span>CALL CLIENT</span>
            </a>

            <a
              href={clientPhone ? waUrl : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center ${
                clientPhone
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
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
              className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-2xl transition-all cursor-pointer shadow-xl shadow-amber-500/20 uppercase tracking-wider flex items-center justify-center gap-1.5"
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
