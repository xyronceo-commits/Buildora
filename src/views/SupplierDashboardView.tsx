import React, { useState } from 'react';
import {
  Building,
  Plus,
  Eye,
  PhoneCall,
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
  const isDemoUser = typeof window !== 'undefined' && localStorage.getItem('buildora_demo_active') === 'true';
  const [activeTab, setActiveTab] = useState<'listings' | 'quotes' | 'verification' | 'profile'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>(() => {
    if (!isDemoUser) return [];
    return [
      {
        quoteRequestId: 'qr_1',
        userId: 'usr_10',
        userName: 'Chief K. Adeleke',
        userPhone: '+234 802 334 1122',
        businessId: business.businessId,
        itemName: 'CAT 320 Hydraulic Excavator',
        quantity: '14 Days Rental',
        projectLocation: {
          address: 'Ring Road Phase 2',
          city: 'Osogbo',
          state: 'Osun',
          country: 'Nigeria',
          latitude: 7.7827,
          longitude: 4.5418,
        },
        message: 'Need CAT 320 for foundation trenching on our commercial site in Osogbo. Please confirm daily operator rate.',
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  const supplierListings = listings.filter((l) => l.businessId === business.businessId || l.ownerId === currentUser?.uid);

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#121418] border border-slate-800 p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30 uppercase">
                {business.category}
              </span>
              <VerificationBadge status={business.verificationStatus} size="sm" />
            </div>
            <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white">
              {business.businessName}
            </h1>
            <p className="text-xs text-slate-400">Supplier Fleet & Inventory Management Portal</p>
          </div>

          <button
            onClick={onAddListingClick}
            className="flex items-center gap-2 bg-amber-500 text-black font-extrabold px-5 py-3 rounded-xl text-xs hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/20 uppercase tracking-wider"
          >
            <Plus className="h-4 w-4" /> ADD NEW LISTING
          </button>
        </div>

        {/* Supplier Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Profile Views</div>
            <div className="text-lg font-black text-white mt-0.5">1,480</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Search Appearances</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">3,210</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Calls / WhatsApp</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">84</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Quote Requests</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{quoteRequests.length}</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center col-span-2 sm:col-span-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Saved By Users</div>
            <div className="text-lg font-black text-white mt-0.5">129</div>
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
        </div>
      )}

      {/* Tab 2: Quote Requests Inbox */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {quoteRequests.map((req) => (
            <div key={req.quoteRequestId} className="rounded-2xl bg-[#121418] border border-slate-800 p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="font-bold text-white text-sm">{req.userName}</span>
                  <span className="text-slate-400 text-[11px] block">{req.userPhone}</span>
                </div>
                <span className="bg-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded text-[10px] uppercase">
                  STATUS: {req.status}
                </span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                <div>Item Requested: <strong className="text-amber-400">{req.itemName}</strong></div>
                <div>Quantity/Duration: <strong className="text-white">{req.quantity}</strong></div>
                <div>Site Location: <strong className="text-white">{req.projectLocation.address}, {req.projectLocation.city}</strong></div>
              </div>

              <p className="text-slate-300 italic">"{req.message}"</p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => window.location.href = `tel:${req.userPhone}`}
                  className="bg-amber-500 text-black font-extrabold px-4 py-2 rounded-xl text-xs hover:bg-amber-400 cursor-pointer"
                >
                  Call Client Back
                </button>
              </div>
            </div>
          ))}
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
