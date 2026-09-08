import React, { useState } from 'react';
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
} from 'lucide-react';
import { Business, Listing, QuoteRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { VerificationBadge } from '../components/VerificationBadge';

interface SupplierDashboardViewProps {
  business: Business;
  listings: Listing[];
  initialTab?: 'listings' | 'quotes' | 'verification';
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
  const [activeTab, setActiveTab] = useState<'listings' | 'quotes' | 'verification' | 'profile'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Strictly filter listings belonging to the logged in user or supplier account
  const supplierListings = listings.filter(
    (l) => (currentUser?.uid && l.ownerId === currentUser.uid) || (currentUser?.businessId && l.businessId === currentUser.businessId)
  );

  const supplierListingIds = new Set(supplierListings.map((l) => l.listingId));

  const quoteRequests = passedQuoteRequests.filter(
    (q) =>
      (business?.businessId && q.businessId === business.businessId) ||
      (currentUser?.uid && q.supplierId === currentUser.uid) ||
      (q.listingId && supplierListingIds.has(q.listingId))
  );

  const availableListingsCount = supplierListings.filter((l) => l.availability?.status === 'AVAILABLE').length;
  const rentedListingsCount = supplierListings.filter((l) => l.availability?.status !== 'AVAILABLE').length;

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#121418] border border-slate-800 p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <VerificationBadge status={business.verificationStatus} size="sm" />
            </div>
            <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white">
              {currentUser?.displayName || (business.businessName.includes('Osun Heavy') ? 'Company Name' : business.businessName)}
            </h1>
            <p className="text-xs text-amber-400 font-extrabold uppercase tracking-wider mt-0.5">
              Equipment Rental
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mt-2">
              <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Registered Address: <strong className="text-white">{business.location?.address || 'Plot 12, Gbongan Road Industrial Zone'}, {business.location?.city || 'Osogbo'}, {business.location?.state || 'Osun State'}</strong></span>
            </div>
          </div>

          <button
            onClick={onAddListingClick}
            className="flex items-center gap-2 bg-amber-500 text-black font-extrabold px-5 py-3 rounded-xl text-xs hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/20 uppercase tracking-wider"
          >
            <Plus className="h-4 w-4" /> ADD NEW LISTING
          </button>
        </div>

        {/* Real Dynamic Supplier Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Published Listings</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{supplierListings.length}</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Available Equipment</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{availableListingsCount}</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Rented / In Field</div>
            <div className="text-lg font-black text-white mt-0.5">{rentedListingsCount}</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Quote Requests</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{quoteRequests.length}</div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800 pt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'listings' ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-400'
            }`}
          >
            LISTINGS & INVENTORY ({supplierListings.length})
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'quotes' ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-400'
            }`}
          >
            QUOTE REQUESTS ({quoteRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'verification' ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-400'
            }`}
          >
            VERIFICATION STATUS
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
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {quoteRequests.length === 0 ? (
            <div className="rounded-3xl bg-[#121418] border border-slate-800 p-8 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <Inbox className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Quote Requests Received Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When project managers and site engineers send quote inquiries for your machinery or material listings, they will appear here in real-time.
                </p>
              </div>
            </div>
          ) : (
            quoteRequests.map((req) => (
              <div key={req.quoteRequestId} className="rounded-2xl bg-[#121418] border border-amber-500/30 p-5 space-y-3 text-xs shadow-xl">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-black font-extrabold px-2 py-0.5 rounded text-[10px] uppercase">
                        NEW QUOTE REQUEST
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-extrabold text-white text-base block mt-1">{req.userName}</span>
                    <span className="text-slate-400 text-[11px] block">{req.userPhone || 'No phone provided'}</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase">
                    STATUS: {req.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="text-xs">Requested Product: <strong className="text-amber-400 font-extrabold">{req.itemName || req.listingTitle}</strong></div>
                  <div className="text-xs">Quantity / Duration: <strong className="text-white font-bold">{req.quantity}</strong></div>
                  <div className="text-xs">Target Project Site: <strong className="text-slate-200">{req.projectName} ({req.projectLocation.address || req.projectLocation.city})</strong></div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-slate-300 italic">
                  "{req.message}"
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {req.userPhone && (
                    <button
                      onClick={() => window.location.href = `tel:${req.userPhone}`}
                      className="bg-amber-500 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs hover:bg-amber-400 cursor-pointer shadow-md shadow-amber-500/10 flex items-center gap-1.5 uppercase tracking-wider"
                    >
                      <PhoneCall className="h-3.5 w-3.5" /> Call Client Back
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Verification Details */}
      {activeTab === 'verification' && (
        <div className="rounded-3xl bg-[#121418] border border-slate-800 p-6 space-y-4 text-xs">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-500" /> BUILDORA SUPPLIER VERIFICATION
          </h3>
          <p className="text-slate-300">
            Buildora verifies equipment rental yards, block factories and material suppliers to ensure safety and trust for contractors.
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
    </div>
  );
};
