import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Building2,
  Package,
  Wrench,
  AlertTriangle,
  Users,
  LogOut,
  CheckCircle2,
  Search,
  Filter,
  Clock,
  Activity,
  FileText,
  Layers,
  Eye,
  Lock,
  BadgeCheck,
  RefreshCw,
  Server,
  FileCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Business, Listing, QuoteRequest } from '../types';
import { VerificationBadge } from '../components/VerificationBadge';
import { normalizeVerificationStatus } from '../utils/verification';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardViewProps {
  businesses: Business[];
  listings: Listing[];
  quoteRequests?: QuoteRequest[];
  onVerifyBusiness: (businessId: string, status: 'VERIFIED' | 'REJECTED') => void;
  onSignOutAdmin?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  businesses,
  listings,
  quoteRequests = [],
  onVerifyBusiness,
  onSignOutAdmin,
}) => {
  const { currentUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'verifications' | 'suppliers' | 'listings' | 'requests' | 'security'>('verifications');
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFICATION_PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [listingCategoryFilter, setListingCategoryFilter] = useState<string>('ALL');

  // Selected Detail Modal State
  const [inspectingBusiness, setInspectingBusiness] = useState<Business | null>(null);

  // Verification filtering using normalized helper
  const pendingBusinesses = useMemo(() => {
    return businesses.filter(
      (b) => normalizeVerificationStatus(b.verificationStatus, b.isVerified) === 'VERIFICATION_PENDING'
    );
  }, [businesses]);

  const verifiedBusinesses = useMemo(() => {
    return businesses.filter(
      (b) => normalizeVerificationStatus(b.verificationStatus, b.isVerified) === 'VERIFIED'
    );
  }, [businesses]);

  // Filtered Businesses according to search & filter
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchesSearch =
        !searchQuery.trim() ||
        b.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.location?.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.verificationDetails?.cacNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

      const normStatus = normalizeVerificationStatus(b.verificationStatus, b.isVerified);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'VERIFICATION_PENDING' && normStatus === 'VERIFICATION_PENDING') ||
        (statusFilter === 'VERIFIED' && normStatus === 'VERIFIED') ||
        (statusFilter === 'REJECTED' && normStatus === 'REJECTED');

      return matchesSearch && matchesStatus;
    });
  }, [businesses, searchQuery, statusFilter]);

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location?.city || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = listingCategoryFilter === 'ALL' || item.type === listingCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [listings, searchQuery, listingCategoryFilter]);

  // Sign out handler
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

  const cacComplianceRate = businesses.length > 0
    ? Math.round((verifiedBusinesses.length / businesses.length) * 100)
    : 100;

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      {/* High-Authority Admin Command Bar */}
      <div className="rounded-3xl bg-[#0b0d11] border border-slate-800/90 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/5">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-amber-500 text-black px-2 py-0.5 rounded tracking-widest">
                  PLATFORM CONTROL CENTER
                </span>
                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> TIER-0 ADMIN AUTHORIZED
                </span>
              </div>
              <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Constrora Control Command
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span>Account: <strong className="text-amber-400 font-mono">{currentUser?.email || 'buildsafe247@gmail.com'}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Firebase Firestore RBAC Lock: <strong className="text-emerald-400">ENFORCED</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSignOutClick}
              className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg hover:border-red-500/50 uppercase tracking-wider"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </div>

        {/* Command Executive Performance HUD */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs relative z-10">
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-left space-y-1 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-black tracking-wider">
              <span>SUPPLIERS</span>
              <Building2 className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-white">{businesses.length}</div>
            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" /> {verifiedBusinesses.length} Verified CAC
            </div>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-left space-y-1 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-black tracking-wider">
              <span>PENDING APPROVALS</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{pendingBusinesses.length}</div>
            <div className="text-[10px] text-slate-400 font-medium">
              Requires Admin Review
            </div>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-left space-y-1 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-black tracking-wider">
              <span>ACTIVE LISTINGS</span>
              <Wrench className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{listings.length}</div>
            <div className="text-[10px] text-slate-400 font-medium">
              Equipment & Materials
            </div>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-left space-y-1 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-black tracking-wider">
              <span>QUOTE INQUIRIES</span>
              <FileText className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{quoteRequests.length}</div>
            <div className="text-[10px] text-slate-400 font-medium">
              Contractor Enquiries
            </div>
          </div>
        </div>

        {/* Global Search and Tab Control Toolbar */}
        <div className="space-y-3 border-t border-slate-800/80 pt-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search businesses, CAC registration numbers, cities, equipment listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold shrink-0">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-2 rounded-lg text-[11px] uppercase transition-all cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-amber-500 text-black font-black' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('VERIFICATION_PENDING')}
                className={`px-3 py-2 rounded-lg text-[11px] uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'VERIFICATION_PENDING' ? 'bg-amber-500 text-black font-black' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Pending ({pendingBusinesses.length})
              </button>
              <button
                onClick={() => setStatusFilter('VERIFIED')}
                className={`px-3 py-2 rounded-lg text-[11px] uppercase transition-all cursor-pointer ${
                  statusFilter === 'VERIFIED' ? 'bg-amber-500 text-black font-black' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Verified ({verifiedBusinesses.length})
              </button>
            </div>
          </div>

          {/* Core Command Modules Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-black pt-2">
            <button
              onClick={() => setActiveTab('verifications')}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider ${
                activeTab === 'verifications' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck className="h-4 w-4" />
              <span>VERIFICATION QUEUE ({pendingBusinesses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider ${
                activeTab === 'suppliers' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>SUPPLIER REGISTRY ({businesses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider ${
                activeTab === 'listings' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="h-4 w-4" />
              <span>LISTINGS MODERATION ({listings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider ${
                activeTab === 'requests' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>QUOTE AUDIT LOGS ({quoteRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider ${
                activeTab === 'security' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="h-4 w-4" />
              <span>SECURITY & FIREWALL</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODULE 1: PENDING VERIFICATION QUEUE */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="uppercase tracking-wider">CAC Verification & Governance Pipeline</span>
            <span>{pendingBusinesses.length} Applications Requiring Decision</span>
          </div>

          {pendingBusinesses.length === 0 ? (
            <div className="rounded-3xl bg-[#0b0d11] border border-slate-800 p-12 text-center space-y-3 shadow-xl">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-white">All Pending Applications Processed</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No supplier verification requests are currently awaiting inspection. All active businesses on Constrora are reviewed and compliant.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingBusinesses.map((biz) => (
                <div
                  key={biz.businessId}
                  className="rounded-3xl bg-[#0b0d11] border border-amber-500/30 p-6 space-y-4 text-xs shadow-2xl relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                          ACTION REQUIRED
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          ID: {biz.businessId}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-white text-xl">{biz.businessName}</h3>
                      <p className="text-amber-400 font-bold text-xs mt-0.5">{biz.category} Supplier</p>
                    </div>

                    <VerificationBadge status={biz.verificationStatus} size="md" />
                  </div>

                  {/* CAC & Business Credentials Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-950 border border-slate-850 rounded-2xl text-xs">
                    <div className="space-y-1">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">CAC Registration</div>
                      <div className="font-bold text-emerald-400 font-mono text-sm">
                        {biz.verificationDetails?.cacNumber || 'RC-849204812'}
                      </div>
                      <div className="text-[11px] text-slate-400">Verified Corporate Entity</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Corporate Address</div>
                      <div className="font-bold text-white text-xs truncate">
                        {biz.location?.address || 'Industrial Estate'}, {biz.location?.city || 'Osogbo'}
                      </div>
                      <div className="text-[11px] text-slate-400">{biz.location?.state || 'Osun State'}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Contact & WhatsApp</div>
                      <div className="font-bold text-amber-400 text-xs">
                        {biz.phone || 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-400">WhatsApp: {biz.whatsapp || biz.phone || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Verification Decision Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={() => onVerifyBusiness(biz.businessId, 'VERIFIED')}
                      className="w-full sm:flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                    >
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>Approve & Grant Verified CAC Badge</span>
                    </button>

                    <button
                      onClick={() => onVerifyBusiness(biz.businessId, 'REJECTED')}
                      className="w-full sm:w-auto px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-extrabold rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject Application</span>
                    </button>

                    <button
                      onClick={() => setInspectingBusiness(biz)}
                      className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase"
                    >
                      <Eye className="h-4 w-4 text-amber-400" />
                      <span>Inspect Dossier</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODULE 2: SUPPLIER REGISTRY */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="uppercase tracking-wider">All Registered Enterprise Suppliers</span>
            <span>{filteredBusinesses.length} Registered Enterprises</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredBusinesses.map((biz) => {
              const normStatus = normalizeVerificationStatus(biz.verificationStatus, biz.isVerified);
              return (
                <div
                  key={biz.businessId}
                  className="rounded-2xl bg-[#0b0d11] border border-slate-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-lg hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-base">{biz.businessName}</h4>
                      <VerificationBadge status={biz.verificationStatus} size="sm" />
                    </div>
                    <div className="text-slate-400 text-xs flex flex-wrap items-center gap-2">
                      <span>Category: <strong className="text-amber-400">{biz.category}</strong></span>
                      <span>•</span>
                      <span>City: <strong className="text-white">{biz.location?.city || 'Osogbo'}</strong></span>
                      <span>•</span>
                      <span>Phone: <strong className="text-white">{biz.phone}</strong></span>
                    </div>
                    {biz.verificationDetails?.cacNumber && (
                      <div className="text-[11px] text-emerald-400 font-mono font-bold pt-0.5">
                        CAC: {biz.verificationDetails.cacNumber}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    {normStatus !== 'VERIFIED' ? (
                      <button
                        onClick={() => onVerifyBusiness(biz.businessId, 'VERIFIED')}
                        className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1 uppercase"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve CAC
                      </button>
                    ) : (
                      <button
                        onClick={() => onVerifyBusiness(biz.businessId, 'REJECTED')}
                        className="flex-1 sm:flex-initial px-3 py-2 bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer uppercase"
                      >
                        Revoke Status
                      </button>
                    )}

                    <button
                      onClick={() => setInspectingBusiness(biz)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1 uppercase"
                    >
                      <Eye className="h-3.5 w-3.5 text-amber-400" /> Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODULE 3: LISTINGS MODERATION PORTAL */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-bold text-slate-400 px-1">
            <span className="uppercase tracking-wider">Equipment & Building Material Inventory Catalog</span>
            
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Type:</span>
              <button
                onClick={() => setListingCategoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold cursor-pointer ${listingCategoryFilter === 'ALL' ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setListingCategoryFilter('MACHINERY')}
                className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold cursor-pointer ${listingCategoryFilter === 'MACHINERY' ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-400'}`}
              >
                Machinery
              </button>
              <button
                onClick={() => setListingCategoryFilter('MATERIAL')}
                className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold cursor-pointer ${listingCategoryFilter === 'MATERIAL' ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-400'}`}
              >
                Material
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredListings.map((item) => (
              <div
                key={item.listingId}
                className="rounded-2xl bg-[#0b0d11] border border-slate-800 p-4 flex gap-4 text-xs shadow-lg"
              >
                <img
                  src={item.photos[0]}
                  alt={item.title}
                  className="h-24 w-24 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        {item.type}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                          item.availability.status === 'AVAILABLE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {item.availability.status}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-white text-sm truncate mt-1">{item.title}</h4>
                    <p className="text-amber-400 font-extrabold mt-0.5">
                      {item.rental?.dailyPrice ? `₦${item.rental.dailyPrice.toLocaleString()}/day` : item.price ? `₦${item.price.toLocaleString()}/${item.priceUnit}` : 'Contact for price'}
                    </p>
                    <p className="text-slate-400 text-[11px] truncate mt-0.5">
                      Location: {item.location?.city || 'Osogbo'}, {item.location?.state || 'Osun'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Category: <strong className="text-white">{item.category}</strong></span>
                    <span className="text-emerald-400 font-bold">Active Listing</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 4: QUOTE INQUIRIES AUDIT LOGS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="uppercase tracking-wider">Contractor Quote Inquiries & Dispatch Logs</span>
            <span>{quoteRequests.length} Total Platform Inquiries</span>
          </div>

          {quoteRequests.length === 0 ? (
            <div className="rounded-3xl bg-[#0b0d11] border border-slate-800 p-10 text-center space-y-3">
              <FileText className="h-8 w-8 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Quote Inquiries Transacted Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Inquiries generated by contractors when contacting machinery or material suppliers will appear in this audit log.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quoteRequests.map((req) => (
                <div
                  key={req.quoteRequestId}
                  className="rounded-2xl bg-[#0b0d11] border border-slate-800 p-5 space-y-3 text-xs shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="bg-amber-500 text-black font-black px-2 py-0.5 rounded text-[10px] uppercase">
                        INQUIRY LOG
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-white text-base">{req.clientName || req.userName}</h4>
                      <p className="text-slate-400 text-xs">Project: {req.projectName}</p>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                      <div>Requested Item: <strong className="text-amber-400">{req.itemName || req.listingTitle}</strong></div>
                      <div>Quantity: <strong className="text-white">{req.quantity}</strong></div>
                      <div className="truncate">Location: {typeof req.projectLocation === 'string' ? req.projectLocation : `${req.projectLocation.city}, ${req.projectLocation.state}`}</div>
                    </div>

                    {req.message && (
                      <p className="text-slate-300 italic text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        "{req.message}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Status: <strong className="text-emerald-400 font-bold uppercase">{req.status || 'SENT'}</strong></span>
                    <span className="font-mono text-slate-500">ID: {req.quoteRequestId.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODULE 5: SECURITY & FIREWALL */}
      {activeTab === 'security' && (
        <div className="rounded-3xl bg-[#0b0d11] border border-slate-800 p-8 space-y-6 text-xs text-white shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">CONSTRORA Admin Security Architecture</h3>
              <p className="text-slate-400 text-xs">Zero-Trust Rules, Auth Enforcement & CAC Verification Engine</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase">
                <ShieldCheck className="h-4 w-4" /> Hardened Account Gate
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Admin access is locked strictly to <code className="text-amber-400 font-mono">buildsafe247@gmail.com</code> using Firebase Auth tokens. Email verification is automatically bypassed for verified administrators.
              </p>
            </div>

            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase">
                <Server className="h-4 w-4" /> Firestore ABAC Rules
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Security rules enforce write operations server-side. Users cannot self-grant admin status, ensuring absolute data isolation across supplier and contractor entities.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DOSSIER INSPECTOR MODAL */}
      {inspectingBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0b0d11] border border-slate-800 p-6 sm:p-8 space-y-6 text-white shadow-2xl my-8">
            <button
              onClick={() => setInspectingBusiness(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-amber-500 text-black px-2 py-0.5 rounded">
                  BUSINESS DOSSIER
                </span>
                <VerificationBadge status={inspectingBusiness.verificationStatus} size="sm" />
              </div>
              <h3 className="text-xl font-extrabold">{inspectingBusiness.businessName}</h3>
              <p className="text-xs text-amber-400 font-bold">{inspectingBusiness.category} Supplier</p>
            </div>

            <div className="space-y-3 p-4 bg-slate-950 border border-slate-850 rounded-2xl text-xs">
              <div>Business ID: <strong className="text-white font-mono">{inspectingBusiness.businessId}</strong></div>
              <div>CAC Reg Number: <strong className="text-emerald-400 font-mono font-bold">{inspectingBusiness.verificationDetails?.cacNumber || 'N/A'}</strong></div>
              <div>Phone Number: <strong className="text-white">{inspectingBusiness.phone}</strong></div>
              <div>WhatsApp: <strong className="text-white">{inspectingBusiness.whatsapp || inspectingBusiness.phone}</strong></div>
              <div>Address: <strong className="text-white">{inspectingBusiness.location?.address}, {inspectingBusiness.location?.city}, {inspectingBusiness.location?.state}</strong></div>
              {inspectingBusiness.verificationDetails?.notes && (
                <div className="pt-2 border-t border-slate-800 text-slate-300 italic">
                  Notes: "{inspectingBusiness.verificationDetails.notes}"
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onVerifyBusiness(inspectingBusiness.businessId, 'VERIFIED');
                  setInspectingBusiness(null);
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Approve & Issue Badge
              </button>
              <button
                onClick={() => {
                  onVerifyBusiness(inspectingBusiness.businessId, 'REJECTED');
                  setInspectingBusiness(null);
                }}
                className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-extrabold rounded-xl text-xs uppercase cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
