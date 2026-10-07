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
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 ">
 <motion.div
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.95, opacity: 0 }}
 className="relative w-full max-w-xl rounded-lg bg-white dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] p-6 sm:p-8 text-[#111111] dark:text-white space-y-6"
 >
 <button
 onClick={onClose}
 className="absolute top-5 right-5 text-[#27272A] hover:text-[#111111] dark:text-neutral-500 dark:text-neutral-400 dark:hover:text-white p-1.5 rounded-xl hover:bg-neutral-100 dark:bg-[#18181B] dark:hover:bg-[#27272A] transition-colors cursor-pointer"
 >
 <X className="h-5 w-5" />
 </button>

 {/* Header */}
 <div className="flex items-center gap-3 border-b border-[#E5E5E5] dark:border-[#27272A] pb-4">
 <div className="h-10 w-10 rounded-lg bg-[#FBBF24]/15 border border-[#FBBF24]/30 flex items-center justify-center text-[#F59E0B] dark:text-[#FBBF24]">
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
 <div className="p-4 bg-[#FFFFFF] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#27272A] rounded-lg space-y-3 text-xs">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <span className="text-zinc-600 dark:text-zinc-400 block text-[10px] font-bold uppercase">Client Name</span>
 <span className="font-extrabold text-[#111111] dark:text-white text-sm flex items-center gap-1.5 mt-0.5">
 <User className="h-4 w-4 text-[#F59E0B]" /> {clientName}
 </span>
 </div>

 <div>
 <span className="text-zinc-600 dark:text-zinc-400 block text-[10px] font-bold uppercase">Required Date</span>
 <span className="font-bold text-[#F59E0B] dark:text-[#FBBF24] text-xs flex items-center gap-1.5 mt-0.5">
 <Calendar className="h-4 w-4 text-[#F59E0B]" /> {request.requiredDate || 'As soon as possible'}
 </span>
 </div>

 <div>
 <span className="text-zinc-600 dark:text-zinc-400 block text-[10px] font-bold uppercase">Phone Number</span>
 <span className="font-semibold text-[#111111] dark:text-neutral-300 dark:text-white text-xs flex items-center gap-1.5 mt-0.5">
 <PhoneCall className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" /> {clientPhone || 'Not provided'}
 </span>
 </div>

 {clientEmail && (
 <div>
 <span className="text-zinc-600 dark:text-zinc-400 block text-[10px] font-bold uppercase">Email</span>
 <span className="font-semibold text-[#111111] dark:text-neutral-300 dark:text-white text-xs flex items-center gap-1.5 mt-0.5">
 <Mail className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" /> {clientEmail}
 </span>
 </div>
 )}
 </div>

 <div className="border-t border-[#E5E5E5] dark:border-[#27272A] pt-2.5">
 <span className="text-zinc-600 dark:text-zinc-400 block text-[10px] font-bold uppercase">Project Location</span>
 <span className="font-bold text-[#111111] dark:text-neutral-300 dark:text-white text-xs flex items-center gap-1.5 mt-0.5">
 <MapPin className="h-4 w-4 text-[#F59E0B] shrink-0" /> {projectLoc}
 </span>
 </div>
 </div>

 {/* Requested Items */}
 <div className="space-y-2">
 <h3 className="text-xs font-black text-[#F59E0B] dark:text-[#FBBF24] uppercase tracking-wider flex items-center gap-1.5">
 <Box className="h-4 w-4" /> REQUESTED ITEMS
 </h3>
 <div className="p-4 bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#27272A] rounded-lg space-y-2 ">
 {request.items && request.items.length > 0 ? (
 request.items.map((it, idx) => (
 <div key={idx} className="flex justify-between items-center text-xs font-bold text-[#111111] dark:text-white border-b border-[#E5E5E5] dark:border-[#27272A] dark:border-[#27272A] pb-1.5 last:border-none last:pb-0">
 <span>{it.name}</span>
 <span className="bg-[#FBBF24]/15 text-[#F59E0B] dark:text-[#FBBF24] border border-[#FBBF24]/30 px-2 py-0.5 rounded font-mono font-bold">
 {it.quantity} {it.unit}
 </span>
 </div>
 ))
 ) : (
 <div className="flex justify-between items-center text-xs font-bold text-[#111111] dark:text-white">
 <span>{request.itemName || request.listingTitle || 'Construction Resource'}</span>
 <span className="bg-[#FBBF24]/15 text-[#F59E0B] dark:text-[#FBBF24] border border-[#FBBF24]/30 px-2 py-0.5 rounded font-mono font-bold">
 {request.quantity}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Client Message */}
 {request.message && (
 <div className="space-y-1.5">
 <h3 className="text-xs font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">CLIENT MESSAGE</h3>
 <div className="p-3.5 bg-[#FFFFFF] dark:bg-[#111111]/90 border border-[#E5E5E5] dark:border-[#27272A] rounded-xl text-zinc-600 dark:text-zinc-400 italic text-xs leading-relaxed">
 "{request.message}"
 </div>
 </div>
 )}

 {/* Supplier Action Buttons (Section 7) */}
 <div className="border-t border-[#E5E5E5] dark:border-[#27272A] pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
 <a
 href={clientPhone ? `tel:${clientPhone}` : '#'}
 className={`px-4 py-3 rounded-lg font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center ${
 clientPhone
 ? 'bg-neutral-100 dark:bg-[#18181B] hover:bg-neutral-100 dark:bg-[#18181B] dark:hover:bg-[#27272A] text-[#111111] dark:text-white cursor-pointer'
 : 'bg-neutral-100 dark:bg-[#18181B] dark:bg-[#111111] text-neutral-500 dark:text-neutral-400 dark:text-neutral-600 dark:text-neutral-400 cursor-not-allowed'
 }`}
 >
 <PhoneCall className="h-4 w-4 text-[#F59E0B]" />
 <span>CALL CLIENT</span>
 </a>

 <a
 href={clientPhone ? waUrl : '#'}
 target="_blank"
 rel="noopener noreferrer"
 className={`px-4 py-3 rounded-lg font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center ${
 clientPhone
 ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer '
 : 'bg-neutral-100 dark:bg-[#18181B] dark:bg-[#111111] text-neutral-500 dark:text-neutral-400 dark:text-neutral-600 dark:text-neutral-400 cursor-not-allowed'
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
 className="px-4 py-3 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black text-xs rounded-lg transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
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
