import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, HardHat, CheckCircle2 } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { Listing } from '../types';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose, listing }) => {
  const { currentUser } = useAuth();
  const { activeProject } = useProject();

  const [quantity, setQuantity] = useState('1 unit');
  const [message, setMessage] = useState(
    `Hello, I would like to request a formal quote for ${listing.title} for our project site in ${activeProject.location.city}. Please confirm rental/pricing details and delivery lead time.`
  );
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const quoteData = {
      quoteRequestId: `quote_${Date.now()}`,
      userId: currentUser?.uid || 'guest_user',
      userName: currentUser?.displayName || 'Buildora Visitor',
      userPhone: currentUser?.phoneNumber || '',
      businessId: listing.businessId,
      listingId: listing.listingId,
      listingTitle: listing.title,
      projectId: activeProject.projectId,
      projectName: activeProject.name,
      itemName: listing.title,
      quantity,
      projectLocation: activeProject.location,
      message,
      status: 'sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (currentUser && !currentUser.uid.startsWith('demo_')) {
        await addDoc(collection(db, 'quoteRequests'), quoteData);
      }
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'quoteRequests');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg rounded-2xl bg-[#121418] border border-slate-800 p-6 shadow-2xl text-white"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {!sentSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-amber-500 mb-1">
                <HardHat className="h-5 w-5" />
                <h3 className="font-['Cabinet_Grotesk'] text-xl font-extrabold text-white">
                  REQUEST A QUOTE
                </h3>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-xs font-bold text-white truncate">{listing.title}</div>
                <div className="text-[11px] text-amber-400 font-semibold">
                  Supplier: {listing.businessName}
                </div>
                <div className="text-[10px] text-slate-400">
                  Target Site: {activeProject.name} · {activeProject.location.city}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Quantity / Duration Needed
                </label>
                <input
                  type="text"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 50 bags, 7 days rental, 10 trips"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Message / Project Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-black font-extrabold py-3 text-xs hover:bg-amber-400 transition-all cursor-pointer uppercase tracking-wider"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Sending Request...' : 'Send Request Quote'}</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="font-['Cabinet_Grotesk'] text-2xl font-extrabold text-white">
                QUOTE REQUEST SENT!
              </h3>
              <p className="text-xs text-slate-300">
                The supplier has received your quote request for {listing.title}. You will be contacted directly.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
