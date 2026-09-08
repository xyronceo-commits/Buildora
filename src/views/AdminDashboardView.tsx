import React, { useState } from 'react';
import { ShieldCheck, Check, X, Building2, Package, Wrench, AlertTriangle, Users } from 'lucide-react';
import { Business, Listing } from '../types';
import { VerificationBadge } from '../components/VerificationBadge';

interface AdminDashboardViewProps {
  businesses: Business[];
  listings: Listing[];
  onVerifyBusiness: (businessId: string, status: 'VERIFIED' | 'REJECTED') => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  businesses,
  listings,
  onVerifyBusiness,
}) => {
  const [activeTab, setActiveTab] = useState<'verifications' | 'listings' | 'reports'>('verifications');

  const pendingBusinesses = businesses.filter((b) => b.verificationStatus === 'VERIFICATION_PENDING');

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      <div className="rounded-3xl bg-[#121418] border border-slate-800 p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-['Cabinet_Grotesk'] text-2xl font-black text-white">
              BUILDORA ADMIN & MODERATION CONTROL
            </h1>
            <p className="text-xs text-slate-400">Supplier Verification & Platform Oversight System</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Total Businesses</div>
            <div className="text-lg font-black text-white mt-0.5">{businesses.length}</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Pending Approvals</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{pendingBusinesses.length}</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Total Listings</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{listings.length}</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Verified Suppliers</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">
              {businesses.filter((b) => b.verificationStatus === 'VERIFIED').length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800 pt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'verifications' ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-400'
            }`}
          >
            PENDING VERIFICATIONS ({pendingBusinesses.length})
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'listings' ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-400'
            }`}
          >
            ALL REGISTERED SUPPLIERS ({businesses.length})
          </button>
        </div>
      </div>

      {activeTab === 'verifications' && (
        <div className="space-y-4">
          {pendingBusinesses.length > 0 ? (
            pendingBusinesses.map((biz) => (
              <div
                key={biz.businessId}
                className="rounded-2xl bg-[#121418] border border-slate-800 p-5 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">{biz.businessName}</h3>
                  <VerificationBadge status={biz.verificationStatus} size="sm" />
                </div>

                <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                  <div>Category: <strong className="text-amber-400">{biz.category}</strong></div>
                  <div>Phone / WhatsApp: <strong className="text-white">{biz.phone} / {biz.whatsapp}</strong></div>
                  <div>Address: <strong className="text-white">{biz.location.address}, {biz.location.city}</strong></div>
                  {biz.verificationDetails?.cacNumber && (
                    <div>CAC Reg Number: <strong className="text-emerald-400">{biz.verificationDetails.cacNumber}</strong></div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => onVerifyBusiness(biz.businessId, 'VERIFIED')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 text-black font-extrabold py-2.5 rounded-xl text-xs hover:bg-emerald-400 cursor-pointer"
                  >
                    <Check className="h-4 w-4" /> Approve & Issue Verified Badge
                  </button>
                  <button
                    onClick={() => onVerifyBusiness(biz.businessId, 'REJECTED')}
                    className="px-4 py-2.5 border border-red-500/30 text-red-400 font-bold rounded-xl text-xs hover:bg-red-500/10 cursor-pointer"
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-[#121418] border border-slate-800 p-10 text-center text-xs text-slate-400">
              No pending supplier verification requests at this time.
            </div>
          )}
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="space-y-3">
          {businesses.map((biz) => (
            <div
              key={biz.businessId}
              className="rounded-2xl bg-[#121418] border border-slate-800 p-4 flex items-center justify-between text-xs"
            >
              <div>
                <h4 className="font-bold text-white text-sm">{biz.businessName}</h4>
                <p className="text-slate-400 text-[11px]">{biz.location.city} · {biz.category}</p>
              </div>
              <VerificationBadge status={biz.verificationStatus} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
