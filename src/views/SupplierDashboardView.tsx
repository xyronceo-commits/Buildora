import React, { useState, useEffect } from 'react';
import {
  Building,
  Plus,
  Eye,
  PhoneCall,
  MapPin,
  Send,
  Bookmark,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Wrench,
  Package,
  Truck,
  Edit,
  Power,
  Inbox,
  AlertCircle,
  FileText,
  Download,
  Share2,
  MessageSquare,
  Search,
  Filter,
} from 'lucide-react';
import { collection, getDocs, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Business, Listing, QuoteRequest, SupplierQuote } from '../types';
import { useAuth } from '../context/AuthContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { QuoteBuilderModal } from '../components/QuoteBuilderModal';
import { QuoteRequestDetailModal } from '../components/QuoteRequestDetailModal';

interface SupplierDashboardViewProps {
  business?: Business;
  listings: Listing[];
  initialTab?: 'listings' | 'requests' | 'quotes' | 'verification';
  quoteRequests?: QuoteRequest[];
  onAddListingClick: () => void;
  onUpdateAvailability: (listingId: string, status: any) => void;
}

export const SupplierDashboardView: React.FC<SupplierDashboardViewProps> = ({
  business,
  listings,
  initialTab = 'listings',
  quoteRequests: passedQuoteRequests = [],
  onAddListingClick,
  onUpdateAvailability,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'quotes' | 'verification'>(
    initialTab === 'quotes' ? 'quotes' : initialTab === 'requests' ? 'requests' : 'listings'
  );

  // Quote Sub-Filter for Generated Quotes
  const [quoteFilter, setQuoteFilter] = useState<'ALL' | 'DRAFTS' | 'GENERATED'>('ALL');

  // Modal States
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [isRequestDetailOpen, setIsRequestDetailOpen] = useState(false);

  const [builderRequest, setBuilderRequest] = useState<QuoteRequest | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // Supplier Generated Quotes List State
  const [generatedQuotes, setGeneratedQuotes] = useState<SupplierQuote[]>(() => {
    if (!business?.businessId) return [];
    try {
      const saved = localStorage.getItem(`constrora_quotes_${business.businessId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Sync to Firestore and LocalStorage
  useEffect(() => {
    const fetchQuotesFromFirestore = async () => {
      if (!business?.businessId) return;
      try {
        const quotesRef = collection(db, 'businesses', business.businessId, 'quotes');
        const snap = await getDocs(quotesRef);
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as SupplierQuote);
          setGeneratedQuotes(list);
        }
      } catch (e) {
        console.warn('Firestore fetch quotes info:', e);
      }
    };
    fetchQuotesFromFirestore();
  }, [business.businessId]);

  useEffect(() => {
    if (business?.businessId) {
      try {
        localStorage.setItem(`constrora_quotes_${business.businessId}`, JSON.stringify(generatedQuotes));
      } catch (e) {}
    }
  }, [generatedQuotes, business.businessId]);

  React.useEffect(() => {
    if (initialTab) {
      if (initialTab === 'quotes') setActiveTab('quotes');
      else if (initialTab === 'requests') setActiveTab('requests');
      else setActiveTab('listings');
    }
  }, [initialTab]);

  // Real-time Quote Requests State
  const [realtimeRequests, setRealtimeRequests] = useState<QuoteRequest[]>([]);

  // Strictly filter listings belonging to the logged in user or supplier account
  const supplierListings = listings.filter(
    (l) => (currentUser?.uid && l.ownerId === currentUser.uid) || (currentUser?.businessId && l.businessId === currentUser.businessId)
  );

  const supplierListingIds = new Set(supplierListings.map((l) => l.listingId));

  // Subscribe in real-time to Firestore quoteRequests
  useEffect(() => {
    const qRef = collection(db, 'quoteRequests');
    const unsub = onSnapshot(
      qRef,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          ...d.data(),
          quoteRequestId: d.id,
        })) as QuoteRequest[];

        const bizId = business?.businessId || currentUser?.businessId;
        const filtered = docs.filter(
          (q) =>
            (bizId && (q.businessId === bizId || q.supplierBusinessId === bizId)) ||
            (currentUser?.uid && (q.userId === currentUser.uid || q.clientId === currentUser.uid)) ||
            (q.listingId && supplierListingIds.has(q.listingId))
        );

        filtered.sort((a, b) => {
          const tA = new Date(a.createdAt || 0).getTime();
          const tB = new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });

        setRealtimeRequests(filtered);
      },
      (err) => {
        console.warn('Realtime quote requests listener info:', err);
      }
    );

    return () => unsub();
  }, [business?.businessId, currentUser?.uid, currentUser?.businessId, supplierListings.length]);

  const effectiveQuoteRequests = realtimeRequests.length > 0 ? realtimeRequests : passedQuoteRequests.filter(
    (q) =>
      (business?.businessId && (q.businessId === business.businessId || q.supplierBusinessId === business.businessId)) ||
      (currentUser?.uid && q.userId === currentUser.uid) ||
      (q.listingId && supplierListingIds.has(q.listingId))
  );

  const newRequestsCount = effectiveQuoteRequests.filter((q) => q.status === 'NEW' || q.status === 'sent').length;

  const availableListingsCount = supplierListings.filter((l) => l.availability?.status === 'AVAILABLE').length;
  const rentedListingsCount = supplierListings.filter((l) => l.availability?.status !== 'AVAILABLE').length;

  // Filtered generated quotes
  const filteredQuotes = generatedQuotes.filter((q) => {
    if (quoteFilter === 'DRAFTS') return q.status === 'DRAFT';
    if (quoteFilter === 'GENERATED') return q.status === 'GENERATED';
    return true;
  });

  // Handlers
  const handleOpenRequestDetail = async (req: QuoteRequest) => {
    setSelectedRequest(req);
    setIsRequestDetailOpen(true);

    if (req.status === 'NEW' || req.status === 'sent') {
      try {
        const reqRef = doc(db, 'quoteRequests', req.quoteRequestId);
        await updateDoc(reqRef, {
          status: 'VIEWED',
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Could not update request status to VIEWED:', e);
      }
    }
  };

  const handleStartQuoteFromRequest = (req: QuoteRequest) => {
    setBuilderRequest(req);
    setSelectedQuote(null);
    setIsBuilderOpen(true);
  };

  const handleCreateBlankQuote = () => {
    setBuilderRequest(null);
    setSelectedQuote(null);
    setIsBuilderOpen(true);
  };

  const handleEditQuote = (q: SupplierQuote) => {
    setBuilderRequest(null);
    setSelectedQuote(q);
    setIsBuilderOpen(true);
  };

  const handleQuoteSaved = (newQuote: SupplierQuote) => {
    setGeneratedQuotes((prev) => {
      const idx = prev.findIndex((q) => q.quoteId === newQuote.quoteId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newQuote;
        return copy;
      }
      return [newQuote, ...prev];
    });
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#121418] border border-slate-800 p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <VerificationBadge status={business.verificationStatus} size="sm" />
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                SUPPLIER PORTAL
              </span>
            </div>
            <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white">
              {business.businessName || currentUser?.displayName || 'Supplier Business'}
            </h1>
            <p className="text-xs text-amber-400 font-extrabold uppercase tracking-wider mt-0.5">
              Equipment Rental & Material Supplier
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mt-2">
              <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Address: <strong className="text-white">{business.location?.address || 'Industrial Zone'}, {business.location?.city || 'Osogbo'}, {business.location?.state || 'Osun State'}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCreateBlankQuote}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-extrabold px-4 py-3 rounded-2xl text-xs transition-all cursor-pointer shadow-lg uppercase tracking-wider"
            >
              <FileText className="h-4 w-4" /> CREATE QUOTE
            </button>

            <button
              onClick={onAddListingClick}
              className="flex items-center gap-2 bg-amber-500 text-black font-extrabold px-5 py-3 rounded-2xl text-xs hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/20 uppercase tracking-wider"
            >
              <Plus className="h-4 w-4" /> ADD LISTING
            </button>
          </div>
        </div>

        {/* Real Dynamic Supplier Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Listings</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{supplierListings.length}</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Available</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{availableListingsCount}</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Quote Inquiries</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{effectiveQuoteRequests.length}</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Generated Quotes</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{generatedQuotes.length}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'listings' ? 'bg-amber-500 text-black font-black' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            LISTINGS & INVENTORY ({supplierListings.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'requests' ? 'bg-amber-500 text-black font-black' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            QUOTE REQUESTS
            {newRequestsCount > 0 ? (
              <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {newRequestsCount} NEW
              </span>
            ) : (
              <span className="text-slate-400 text-[10px] font-bold">({effectiveQuoteRequests.length})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quotes' ? 'bg-amber-500 text-black font-black' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" /> GENERATED QUOTES ({generatedQuotes.length})
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'verification' ? 'bg-amber-500 text-black font-black' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            VERIFICATION
          </button>
        </div>
      </div>

      {/* Tab 1: Listings & Inventory Management */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {supplierListings.length === 0 ? (
            <div className="rounded-3xl bg-[#121418] border border-slate-800 p-8 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Wrench className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Machinery or Material Listings Added Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Publish your available excavators, mixers, tipper trucks, or building material inventory to start receiving quote requests from site contractors.
                </p>
              </div>
              <button
                onClick={onAddListingClick}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Plus className="h-4 w-4" /> Add Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supplierListings.map((item) => (
                <div
                  key={item.listingId}
                  className="rounded-2xl bg-[#121418] border border-slate-800 p-4 flex gap-4 text-xs"
                >
                  <img
                    src={item.photos[0]}
                    alt={item.title}
                    className="h-24 w-24 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-extrabold uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          {item.type}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            item.availability.status === 'AVAILABLE'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {item.availability.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm truncate mt-1">{item.title}</h4>
                      <p className="text-amber-400 font-extrabold mt-0.5">
                        {item.rental?.dailyPrice ? `₦${item.rental.dailyPrice.toLocaleString()}/day` : item.price ? `₦${item.price.toLocaleString()}/${item.priceUnit}` : 'Contact for price'}
                      </p>
                    </div>

                    {/* Toggle Availability Button */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() =>
                          onUpdateAvailability(
                            item.listingId,
                            item.availability.status === 'AVAILABLE' ? 'CURRENTLY RENTED' : 'AVAILABLE'
                          )
                        }
                        className="flex-1 py-1.5 bg-slate-900 border border-slate-800 hover:border-amber-500 text-slate-200 font-bold rounded-lg text-[11px] cursor-pointer"
                      >
                        {item.availability.status === 'AVAILABLE' ? 'Mark Rented' : 'Mark Available'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Quote Requests Inbox */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {effectiveQuoteRequests.length === 0 ? (
            <div className="rounded-3xl bg-[#121418] border border-slate-800 p-8 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <Inbox className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Quote Requests Received Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When contractors send quote inquiries for your machinery or material listings, they will appear here in real time.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {effectiveQuoteRequests.map((req) => {
                const isNew = req.status === 'NEW' || req.status === 'sent';
                return (
                  <div key={req.quoteRequestId} className={`rounded-2xl bg-[#121418] border p-5 space-y-3 text-xs shadow-xl flex flex-col justify-between transition-all ${isNew ? 'border-amber-500 shadow-amber-500/5' : 'border-slate-800'}`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-800 text-slate-300 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase">
                            QUOTE INQUIRY
                          </span>
                          {isNew ? (
                            <span className="bg-amber-500 text-black font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider animate-pulse">
                              NEW
                            </span>
                          ) : (
                            <span className="bg-slate-800/80 text-slate-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                              VIEWED
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-white text-base">{req.clientName || req.userName}</h4>
                        <p className="text-slate-400 text-xs">{req.projectName}</p>
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                        <div className="text-xs text-slate-300">Item: <strong className="text-amber-400 font-bold">{req.itemName || req.listingTitle}</strong></div>
                        <div className="text-xs text-slate-300">Quantity: <strong className="text-white font-bold">{req.quantity}</strong></div>
                        <div className="text-xs text-slate-400 truncate">Site: {typeof req.projectLocation === 'string' ? req.projectLocation : `${req.projectLocation.city}, ${req.projectLocation.state}`}</div>
                      </div>

                      {req.message && (
                        <p className="text-slate-300 italic text-[11px] line-clamp-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                          "{req.message}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenRequestDetail(req)}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase"
                      >
                        <Eye className="h-4 w-4" /> VIEW REQUEST
                      </button>

                      <button
                        onClick={() => handleStartQuoteFromRequest(req)}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase shadow-md shadow-amber-500/10"
                      >
                        <FileText className="h-4 w-4" /> GENERATE QUOTE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Generated Supplier Quotes Section (Sections 8, 9, 10, 18) */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {/* Sub-Filter Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#121418] border border-slate-800 p-4 rounded-2xl text-xs">
            <div className="flex items-center gap-2 font-bold">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider mr-1">Filter Quotes:</span>
              <button
                onClick={() => setQuoteFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  quoteFilter === 'ALL' ? 'bg-amber-500 text-black font-black' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                ALL ({generatedQuotes.length})
              </button>
              <button
                onClick={() => setQuoteFilter('DRAFTS')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  quoteFilter === 'DRAFTS' ? 'bg-amber-500 text-black font-black' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                DRAFTS ({generatedQuotes.filter((q) => q.status === 'DRAFT').length})
              </button>
              <button
                onClick={() => setQuoteFilter('GENERATED')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  quoteFilter === 'GENERATED' ? 'bg-amber-500 text-black font-black' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                GENERATED ({generatedQuotes.filter((q) => q.status === 'GENERATED').length})
              </button>
            </div>

            <button
              onClick={handleCreateBlankQuote}
              className="bg-amber-500 text-black font-black px-4 py-2 rounded-xl text-xs hover:bg-amber-400 transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
            >
              <Plus className="h-4 w-4" /> CREATE NEW QUOTE
            </button>
          </div>

          {/* Quotes Cards Grid */}
          {filteredQuotes.length === 0 ? (
            <div className="rounded-3xl bg-[#121418] border border-slate-800 p-8 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Generated Quotations Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Build formal PDF quotations for your clients with line item pricing, delivery fees, and discount calculations.
                </p>
              </div>
              <button
                onClick={handleCreateBlankQuote}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Plus className="h-4 w-4" /> Create Quotation Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuotes.map((q) => (
                <div key={q.quoteId} className="rounded-2xl bg-[#121418] border border-slate-800 p-5 space-y-4 text-xs shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="font-mono text-amber-400 font-extrabold text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {q.quoteNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Valid Until: {new Date(q.validUntil).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-white text-base">{q.clientName}</h4>
                      <p className="text-amber-400 text-xs font-semibold">{q.projectName}</p>
                      <p className="text-slate-400 text-[11px] truncate">{q.projectLocation}</p>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="text-[11px] text-slate-400">Items: <strong className="text-white font-bold">{q.items.length} line items</strong></div>
                      <div className="text-sm font-black text-white flex justify-between items-center mt-1 pt-1 border-t border-slate-850">
                        <span className="text-xs text-slate-400 font-normal">Grand Total:</span>
                        <span className="text-amber-400 font-mono">₦{Number(q.grandTotal).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleEditQuote(q)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1 uppercase"
                    >
                      <Eye className="h-3.5 w-3.5 text-amber-400" /> VIEW / EDIT
                    </button>

                    <button
                      onClick={() => handleEditQuote(q)}
                      className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500 hover:text-black text-amber-400 font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1 uppercase"
                      title="Export PDF"
                    >
                      <Download className="h-3.5 w-3.5" /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Verification Details */}
      {activeTab === 'verification' && (
        <div className="rounded-3xl bg-[#121418] border border-slate-800 p-6 space-y-4 text-xs">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-500" /> CONSTRORA SUPPLIER VERIFICATION
          </h3>
          <p className="text-slate-300">
            Constrora verifies equipment rental yards, block factories and material suppliers to ensure safety and trust for contractors.
          </p>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400">Current Status:</span>
              <VerificationBadge status={business.verificationStatus} size="md" />
            </div>
            <p className="text-slate-400 text-[11px]">
              Verified suppliers receive the green ✓ VERIFIED badge across search results and comparison cards.
            </p>
          </div>
        </div>
      )}

      {/* Quote Request Detail Modal */}
      <QuoteRequestDetailModal
        isOpen={isRequestDetailOpen}
        onClose={() => setIsRequestDetailOpen(false)}
        request={selectedRequest}
        onGenerateQuote={(req) => handleStartQuoteFromRequest(req)}
      />

      {/* Quote Builder Modal */}
      <QuoteBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        business={business}
        quoteRequest={builderRequest}
        existingQuote={selectedQuote}
        onQuoteSaved={handleQuoteSaved}
      />
    </div>
  );
};
