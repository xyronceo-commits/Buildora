import React, { useState } from 'react';
import { ShieldCheck, Check, X, Building2, Package, Wrench, AlertTriangle, Users, LogOut, CheckCircle2 } from 'lucide-react';
import { Business, Listing } from '../types';
import { VerificationBadge } from '../components/VerificationBadge';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardViewProps {
  businesses: Business[];
  listings: Listing[];
  onVerifyBusiness: (businessId: string, status: 'VERIFIED' | 'REJECTED') => void;
  onSignOutAdmin?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  businesses,
  listings,
  onVerifyBusiness,
  onSignOutAdmin,
}) => {
  const { currentUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'verifications' | 'suppliers' | 'listings' | 'audit'>('verifications');

  const pendingBusinesses = businesses.filter((b) => b.verificationStatus === 'VERIFICATION_PENDING');

  const handleSignOutClick = async () => {
    try {
      if (onSignOutAdmin) {
        onSignOutAdmin();
      } else {
        await signOut();
      }
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Admin Top Header Banner with Session & Sign Out */}
      <div className="rounded-3xl bg-[#121418] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-['Cabinet_Grotesk'] text-xl sm:text-2xl font-black text-white tracking-tight">
                  CONSTRORA ADMIN PORTAL
                </h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> VERIFIED SESSION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorized Account: <strong className="text-amber-400">{currentUser?.email || 'buildsafe247@gmail.com'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOutClick}
            className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Platform Overview Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Businesses</div>
            <div className="text-2xl font-black text-white mt-1">{businesses.length}</div>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Pending Approvals</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{pendingBusinesses.length}</div>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Active Listings</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{listings.length}</div>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Verified Suppliers</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {businesses.filter((b) => b.verificationStatus === 'VERIFIED').length}
            </div>
          </div>
        </div>

        {/* Secondary Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4 text-xs font-extrabold">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'verifications' ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            PENDING VERIFICATIONS ({pendingBusinesses.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'suppliers' ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            REGISTERED SUPPLIERS ({businesses.length})
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'listings' ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            PLATFORM LISTINGS ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'audit' ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            SECURITY & LOGS
          </button>
        </div>
      </div>

      {/* Tab Contents */}
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
            <div className="rounded-2xl bg-[#121418] border border-slate-800 p-10 text-center text-xs text-slate-400 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto opacity-80" />
              <p className="font-bold text-slate-200">All caught up!</p>
              <p>No pending supplier verification requests at this time.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="space-y-3">
          {businesses.map((biz) => (
            <div
              key={biz.businessId}
              className="rounded-2xl bg-[#121418] border border-slate-800 p-4 flex items-center justify-between text-xs"
            >
              <div>
                <h4 className="font-bold text-white text-sm">{biz.businessName}</h4>
                <p className="text-slate-400 text-[11px]">{biz.location.city} · {biz.category} · Phone: {biz.phone}</p>
              </div>
              <VerificationBadge status={biz.verificationStatus} size="sm" />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="space-y-3">
          {listings.map((item) => (
            <div
              key={item.listingId}
              className="rounded-2xl bg-[#121418] border border-slate-800 p-4 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                <p className="text-slate-400 text-[11px]">{item.category} · {item.pricing.rateDisplay} · {item.location.city}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${item.isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400'}`}>
                {item.isAvailable ? 'AVAILABLE' : 'RENTED / BUSY'}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="rounded-2xl bg-[#121418] border border-slate-800 p-6 space-y-4 text-xs">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Security & Access Policy</h3>
          <div className="p-4 bg-slate-900 rounded-xl space-y-2 text-slate-300 leading-relaxed border border-slate-800">
            <div>• <strong className="text-white">Strict Email Gate:</strong> Access to this admin portal is restricted exclusively to <code className="text-amber-400">buildsafe247@gmail.com</code> verified via Firebase Google OAuth.</div>
            <div>• <strong className="text-white">Server-Side Security Rules:</strong> All Firestore read and write operations for admin data are enforced server-side using Firebase Firestore rules (<code className="text-emerald-400">request.auth.token.email.lower() == 'buildsafe247@gmail.com'</code>).</div>
            <div>• <strong className="text-white">Session Control:</strong> Signing out revokes all client-side admin tokens and returns to the Google Authentication screen.</div>
          </div>
        </div>
      )}
    </div>
  );
};
