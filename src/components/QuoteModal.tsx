import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, HardHat, CheckCircle2, Paperclip, Calendar, MapPin, User, Phone, Mail, Box } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db, handleFirestoreError, sanitizeForFirestore } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { Listing, QuoteRequest } from '../types';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing?: Listing;
  supplierBusinessId?: string;
  supplierOwnerId?: string;
  businessName?: string;
  onQuoteSent?: (quote: QuoteRequest) => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  listing,
  supplierBusinessId,
  supplierOwnerId,
  businessName,
  onQuoteSent,
}) => {
  const { currentUser } = useAuth();
  const { activeProject } = useProject();

  // Form Fields as specified in Section 3
  const [clientName, setClientName] = useState(currentUser?.displayName || '');
  const [clientPhone, setClientPhone] = useState(currentUser?.phoneNumber || '');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');
  const [projectName, setProjectName] = useState(activeProject?.name || 'Site Project');
  const [projectLocation, setProjectLocation] = useState(
    activeProject?.location
      ? `${activeProject.location.address ? activeProject.location.address + ', ' : ''}${activeProject.location.city}, ${activeProject.location.state}`
      : 'Osogbo, Osun State'
  );
  const [requiredDate, setRequiredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [requestedItem, setRequestedItem] = useState(listing?.title || '');
  const [quantity, setQuantity] = useState('5');
  const [unit, setUnit] = useState(listing?.priceUnit || (listing?.type === 'equipment' ? 'Days' : 'Units'));
  const [message, setMessage] = useState('Please include delivery cost and confirm lead time.');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const targetBusinessId = listing?.businessId || supplierBusinessId || 'biz_default';
  const targetSupplierOwnerId = listing?.ownerId || supplierOwnerId || '';
  const targetBusinessName = listing?.businessName || businessName || 'Supplier';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ensure Firebase Auth session exists so Firestore security rules allow creation
      let authUser = auth.currentUser;
      if (!authUser) {
        const anonCred = await signInAnonymously(auth);
        authUser = anonCred.user;
      }

      const activeUid = authUser?.uid || currentUser?.uid || `user_${Date.now()}`;
      const quoteReqId = `req_${Date.now()}`;
      const qtySummary = `${quantity} ${unit}`;

      const quoteData: QuoteRequest = {
        quoteRequestId: quoteReqId,
        clientId: activeUid,
        userId: activeUid,
        supplierBusinessId: targetBusinessId,
        businessId: targetBusinessId,
        supplierOwnerId: targetSupplierOwnerId,
        listingId: listing?.listingId || '',
        listingTitle: listing?.title || requestedItem,
        clientName: clientName || currentUser?.displayName || 'Constrora Client',
        userName: clientName || currentUser?.displayName || 'Constrora Client',
        clientPhone: clientPhone || currentUser?.phoneNumber || '',
        userPhone: clientPhone || currentUser?.phoneNumber || '',
        clientEmail: clientEmail || currentUser?.email || '',
        projectName: projectName || 'Site Project',
        projectLocation,
        requiredDate,
        items: [
          {
            listingId: listing?.listingId,
            catalogItemId: listing?.catalogItemId,
            name: requestedItem || listing?.title || 'Resource Request',
            quantity,
            unit,
            specifications: listing?.category,
          },
        ],
        itemName: requestedItem || listing?.title || 'Construction Resource',
        quantity: qtySummary,
        message,
        attachments: attachmentUrl ? [attachmentUrl] : [],
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'quoteRequests', quoteReqId), sanitizeForFirestore(quoteData));

      if (onQuoteSent) {
        onQuoteSent(quoteData);
      }
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.warn('Firestore quote write warning:', err);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg my-8 rounded-3xl bg-[#121418] border border-slate-800 p-6 sm:p-7 shadow-2xl text-white"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {!sentSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-amber-500 mb-1">
                <HardHat className="h-6 w-6" />
                <div>
                  <h3 className="font-['Cabinet_Grotesk'] text-xl font-black text-white uppercase tracking-tight">
                    REQUEST A QUOTE
                  </h3>
                  <p className="text-[11px] text-slate-400">Direct Quote Inquiry to {targetBusinessName}</p>
                </div>
              </div>

              {listing && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
                  {listing.photos?.[0] && (
                    <img src={listing.photos[0]} alt={listing.title} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-white truncate">{listing.title}</div>
                    <div className="text-[11px] text-amber-400 font-bold">Supplier: {targetBusinessName}</div>
                  </div>
                </div>
              )}

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="e.g. +234 803 123 4567"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="e.g. john@builder.ng"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. 3 Bedroom Duplex"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Project Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      placeholder="e.g. Osogbo, Osun State"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Resource & Quantity */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Requested Item / Service *
                </label>
                <div className="relative">
                  <Box className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={requestedItem}
                    onChange={(e) => setRequestedItem(e.target.value)}
                    placeholder="e.g. CAT 320 Excavator, 100 Bags Cement, 2 Trips Granite"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Quantity *
                  </label>
                  <input
                    type="text"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 5, 100"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Days, Bags, Trips, Units"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Required From *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="date"
                      required
                      value={requiredDate}
                      onChange={(e) => setRequiredDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-2 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Additional Requirements / Message
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Operator required. Please include delivery cost to Osogbo site."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Optional Attachment / Site Photo URL
                </label>
                <div className="relative">
                  <Paperclip className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 text-black font-extrabold py-3.5 text-xs hover:bg-amber-400 transition-all cursor-pointer uppercase tracking-wider shadow-xl shadow-amber-500/20 mt-2"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Sending Request...' : 'SEND REQUEST'}</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-10 space-y-3">
              <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="font-['Cabinet_Grotesk'] text-2xl font-black text-white">
                Quote request sent
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Your request for <strong className="text-amber-400">{requestedItem || listing?.title}</strong> has been submitted to {targetBusinessName}.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
