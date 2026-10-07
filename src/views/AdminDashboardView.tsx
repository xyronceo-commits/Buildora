import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
 RefreshCw,
 Loader2,
 Trash2,
 Power,
 ChevronRight,
 ExternalLink,
 Shield,
 UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminStats {
 totalUsers: number;
 clientCount: number;
 supplierCount: number;
 unassignedCount?: number;
 totalBusinesses: number;
 pendingBusinesses: number;
 verifiedBusinesses: number;
 totalListings: number;
 totalQuoteRequests: number;
}

interface AdminUser {
 uid: string;
 email: string;
 displayName: string;
 role: string;
 emailVerified: boolean;
 status: string;
 createdAt: string;
 phoneNumber?: string;
}

interface AdminListing {
 listingId: string;
 businessId: string;
 businessName: string;
 supplierVerificationStatus: string;
 title: string;
 category: string;
 type: string;
 rate: number;
 rateUnit: string;
 status: string;
 photos: string[];
 location: { city: string; state: string };
 createdAt: string;
}

interface AdminDashboardViewProps {
 onSignOutAdmin?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onSignOutAdmin }) => {
 const { currentUser, signOut, getAdminToken } = useAuth();

 const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'verifications'>('overview');
 
 // Data states
 const [stats, setStats] = useState<AdminStats | null>(null);
 const [users, setUsers] = useState<AdminUser[]>([]);
 const [listings, setListings] = useState<AdminListing[]>([]);
 const [loading, setLoading] = useState<boolean>(true);
 const [refreshing, setRefreshing] = useState<boolean>(false);
 const [error, setError] = useState<string | null>(null);

 // Search & Filter
 const [searchQuery, setSearchQuery] = useState('');
 const [roleFilter, setRoleFilter] = useState<'ALL' | 'client' | 'supplier' | 'admin'>('ALL');
 const [listingStatusFilter, setListingStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE' | 'DISABLED'>('ALL');

 // Confirmation Modals
 const [confirmAction, setConfirmAction] = useState<{
 type: 'toggle_user' | 'toggle_listing' | 'delete_listing' | 'verify_business';
 id: string;
 secondaryId?: string;
 title: string;
 description: string;
 newStatus?: string;
 } | null>(null);
 const [actionLoading, setActionLoading] = useState(false);

 // Fetch all admin data securely using Bearer token
 const fetchAdminData = useCallback(async () => {
 setError(null);
 try {
 const token = await getAdminToken();
 if (!token) {
 setError('Authentication token unavailable. Please sign in again.');
 return;
 }

 const headers = {
 Authorization: `Bearer ${token}`,
 'Content-Type': 'application/json',
 };

 const [statsRes, usersRes, listingsRes] = await Promise.all([
 fetch('/api/admin/stats', { headers }),
 fetch('/api/admin/users', { headers }),
 fetch('/api/admin/listings', { headers }),
 ]);

 if (!statsRes.ok || !usersRes.ok || !listingsRes.ok) {
 throw new Error('Failed to load administrative data from backend.');
 }

 const [statsData, usersData, listingsData] = await Promise.all([
 statsRes.json(),
 usersRes.json(),
 listingsRes.json(),
 ]);

 setStats(statsData);
 setUsers(usersData.users || []);
 setListings(listingsData.listings || []);
 } catch (err: any) {
 console.error('[Admin Dashboard Error]:', err);
 setError(err?.message || 'Failed to communicate with administration service.');
 } finally {
 setLoading(false);
 setRefreshing(false);
 }
 }, [getAdminToken]);

 useEffect(() => {
 fetchAdminData();
 }, [fetchAdminData]);

 const handleRefresh = () => {
 setRefreshing(true);
 fetchAdminData();
 };

 // User Status Toggle (Active vs Suspended)
 const handleExecuteUserStatus = async (userId: string, targetStatus: string) => {
 setActionLoading(true);
 try {
 const token = await getAdminToken();
 const res = await fetch(`/api/admin/users/${userId}/status`, {
 method: 'POST',
 headers: {
 Authorization: `Bearer ${token}`,
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ status: targetStatus }),
 });

 if (!res.ok) throw new Error('Status update failed');

 setUsers((prev) =>
 prev.map((u) => (u.uid === userId ? { ...u, status: targetStatus } : u))
 );
 setConfirmAction(null);
 } catch (err: any) {
 alert(err?.message || 'Failed to update user status');
 } finally {
 setActionLoading(false);
 }
 };

 // Listing Availability / Disabled Toggle
 const handleExecuteListingStatus = async (businessId: string, listingId: string, newStatus: string) => {
 setActionLoading(true);
 try {
 const token = await getAdminToken();
 const res = await fetch(`/api/admin/listings/${businessId}/${listingId}/status`, {
 method: 'POST',
 headers: {
 Authorization: `Bearer ${token}`,
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ status: newStatus }),
 });

 if (!res.ok) throw new Error('Listing update failed');

 setListings((prev) =>
 prev.map((l) => (l.listingId === listingId ? { ...l, status: newStatus } : l))
 );
 setConfirmAction(null);
 } catch (err: any) {
 alert(err?.message || 'Failed to update listing status');
 } finally {
 setActionLoading(false);
 }
 };

 // Delete Listing
 const handleExecuteDeleteListing = async (businessId: string, listingId: string) => {
 setActionLoading(true);
 try {
 const token = await getAdminToken();
 const res = await fetch(`/api/admin/listings/${businessId}/${listingId}`, {
 method: 'DELETE',
 headers: {
 Authorization: `Bearer ${token}`,
 },
 });

 if (!res.ok) throw new Error('Delete listing failed');

 setListings((prev) => prev.filter((l) => l.listingId !== listingId));
 setConfirmAction(null);
 } catch (err: any) {
 alert(err?.message || 'Failed to delete listing');
 } finally {
 setActionLoading(false);
 }
 };

 // Verify Supplier Business
 const handleExecuteBusinessVerify = async (businessId: string, status: 'VERIFIED' | 'REJECTED') => {
 setActionLoading(true);
 try {
 const token = await getAdminToken();
 const res = await fetch(`/api/admin/businesses/${businessId}/verify`, {
 method: 'POST',
 headers: {
 Authorization: `Bearer ${token}`,
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ status }),
 });

 if (!res.ok) throw new Error('Verification update failed');

 setListings((prev) =>
 prev.map((l) => (l.businessId === businessId ? { ...l, supplierVerificationStatus: status } : l))
 );
 setConfirmAction(null);
 fetchAdminData();
 } catch (err: any) {
 alert(err?.message || 'Failed to update supplier verification');
 } finally {
 setActionLoading(false);
 }
 };

 // Filtered Users
 const filteredUsers = useMemo(() => {
 return users.filter((u) => {
 const matchesSearch =
 !searchQuery.trim() ||
 u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
 u.displayName.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
 return matchesSearch && matchesRole;
 });
 }, [users, searchQuery, roleFilter]);

 // Filtered Listings
 const filteredListings = useMemo(() => {
 return listings.filter((l) => {
 const matchesSearch =
 !searchQuery.trim() ||
 l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 l.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 l.category.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesStatus = listingStatusFilter === 'ALL' || l.status === listingStatusFilter;
 return matchesSearch && matchesStatus;
 });
 }, [listings, searchQuery, listingStatusFilter]);

 // Pending verification businesses (derived from listings or stats)
 const pendingSuppliers = useMemo(() => {
 const map = new Map<string, AdminListing>();
 listings.forEach((l) => {
 if (l.supplierVerificationStatus === 'VERIFICATION_PENDING' && !map.has(l.businessId)) {
 map.set(l.businessId, l);
 }
 });
 return Array.from(map.values());
 }, [listings]);

 const handleSignOutClick = async () => {
 if (onSignOutAdmin) {
 onSignOutAdmin();
 } else {
 await signOut();
 }
 };

 return (
 <div className="space-y-6 pb-24 max-w-6xl mx-auto px-4">
 {/* Admin Command Header Card */}
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 ">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
 <div className="flex items-center gap-3.5">
 <div className="h-12 w-12 rounded-lg bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] border border-[#FBBF24]/40 flex items-center justify-center shrink-0 ">
 <ShieldCheck className="h-7 w-7 text-[#F59E0B]" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-black uppercase bg-[#FBBF24] text-[#111111] px-2 py-0.5 rounded tracking-widest">
 CONTROL COMMAND
 </span>
 <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
 <CheckCircle2 className="h-3 w-3" /> VERIFIED ADMIN
 </span>
 </div>
 <h1 className="font-['Cabinet_Grotesk'] text-2xl font-black text-[#111111] dark:text-white tracking-tight mt-1">
 Constrora Administrative Console
 </h1>
 <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
 Session: <strong className="text-[#111111] dark:text-white font-mono">{currentUser?.email}</strong>
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2.5">
 <button
 onClick={handleRefresh}
 disabled={refreshing || loading}
 className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-neutral-100 dark:bg-[#18181B] dark:hover:bg-[#111111] text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer disabled:opacity-50"
 title="Refresh Data"
 >
 <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-[#F59E0B]' : ''}`} />
 </button>
 <button
 onClick={handleSignOutClick}
 className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-black transition-all cursor-pointer uppercase tracking-wider"
 >
 <LogOut className="h-4 w-4" />
 <span>Sign Out</span>
 </button>
 </div>
 </div>

 {/* Tab Navigation */}
 <div className="flex items-center gap-2 pt-4 overflow-x-auto text-xs font-black">
 <button
 onClick={() => setActiveTab('overview')}
 className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
 activeTab === 'overview'
 ? 'bg-[#FBBF24] text-[#111111] '
 : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white'
 }`}
 >
 SYSTEM OVERVIEW
 </button>
 <button
 onClick={() => setActiveTab('users')}
 className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
 activeTab === 'users'
 ? 'bg-[#FBBF24] text-[#111111] '
 : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white'
 }`}
 >
 <span>USER ACCOUNTS</span>
 {stats && (
 <span className="text-[10px] px-1.5 py-0.2 bg-[#111111] text-[#FBBF24] rounded-full font-bold">
 {stats.totalUsers}
 </span>
 )}
 </button>
 <button
 onClick={() => setActiveTab('listings')}
 className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
 activeTab === 'listings'
 ? 'bg-[#FBBF24] text-[#111111] '
 : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white'
 }`}
 >
 <span>SUPPLIER LISTINGS</span>
 {stats && (
 <span className="text-[10px] px-1.5 py-0.2 bg-[#111111] text-[#FBBF24] rounded-full font-bold">
 {stats.totalListings}
 </span>
 )}
 </button>
 <button
 onClick={() => setActiveTab('verifications')}
 className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
 activeTab === 'verifications'
 ? 'bg-[#FBBF24] text-[#111111] '
 : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white'
 }`}
 >
 <span>VERIFICATION DESK</span>
 {stats && stats.pendingBusinesses > 0 && (
 <span className="text-[10px] px-1.5 py-0.2 bg-[#FBBF24] text-black rounded-full font-black">
 {stats.pendingBusinesses}
 </span>
 )}
 </button>
 </div>
 </div>

 {/* Global Error Banner */}
 {error && (
 <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
 <AlertTriangle className="h-4 w-4 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 {/* Loading Skeleton */}
 {loading && (
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-3">
 <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B] mx-auto" />
 <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
 Loading Administrative Records...
 </p>
 </div>
 )}

 {!loading && (
 <>
 {/* ===================== TAB 1: OVERVIEW ===================== */}
 {activeTab === 'overview' && stats && (
 <div className="space-y-6">
 {/* Primary Stats Grid */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="p-5 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 space-y-2">
 <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
 <span className="text-[11px] font-black uppercase">Total Accounts</span>
 <Users className="h-4 w-4 text-[#F59E0B]" />
 </div>
 <div className="font-['Cabinet_Grotesk'] text-3xl font-black text-[#111111] dark:text-white">
 {stats.totalUsers}
 </div>
 <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
 {stats.clientCount} Clients · {stats.supplierCount} Suppliers
 {Boolean(stats.unassignedCount && stats.unassignedCount > 0) && ` · ${stats.unassignedCount} Unassigned`}
 </div>
 </div>

 <div className="p-5 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 space-y-2">
 <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
 <span className="text-[11px] font-black uppercase">Registered Fleets</span>
 <Building2 className="h-4 w-4 text-[#F59E0B]" />
 </div>
 <div className="font-['Cabinet_Grotesk'] text-3xl font-black text-[#111111] dark:text-white">
 {stats.totalBusinesses}
 </div>
 <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
 {stats.verifiedBusinesses} Verified · {stats.pendingBusinesses} Pending
 </div>
 </div>

 <div className="p-5 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 space-y-2">
 <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
 <span className="text-[11px] font-black uppercase">Active Listings</span>
 <Wrench className="h-4 w-4 text-[#F59E0B]" />
 </div>
 <div className="font-['Cabinet_Grotesk'] text-3xl font-black text-[#111111] dark:text-white">
 {stats.totalListings}
 </div>
 <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
 Plant machinery & materials
 </div>
 </div>

 <div className="p-5 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 space-y-2">
 <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
 <span className="text-[11px] font-black uppercase">Quote Inquiries</span>
 <FileText className="h-4 w-4 text-[#F59E0B]" />
 </div>
 <div className="font-['Cabinet_Grotesk'] text-3xl font-black text-[#111111] dark:text-white">
 {stats.totalQuoteRequests}
 </div>
 <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
 Total RFQs generated
 </div>
 </div>
 </div>

 {/* Quick Action Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="p-6 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 space-y-3">
 <div className="flex items-center gap-2">
 <ShieldCheck className="h-5 w-5 text-[#F59E0B]" />
 <h3 className="font-['Cabinet_Grotesk'] text-base font-black text-[#111111] dark:text-white uppercase">
 CAC Business Verification
 </h3>
 </div>
 <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
 There are currently <strong>{stats.pendingBusinesses}</strong> supplier business accounts awaiting manual document review.
 </p>
 <button
 onClick={() => setActiveTab('verifications')}
 className="px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all"
 >
 Open Verification Desk
 </button>
 </div>

 <div className="p-6 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 space-y-3">
 <div className="flex items-center gap-2">
 <Lock className="h-5 w-5 text-[#F59E0B]" />
 <h3 className="font-['Cabinet_Grotesk'] text-base font-black text-[#111111] dark:text-white uppercase">
 Platform Security Status
 </h3>
 </div>
 <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
 Firestore security rules enforced via server-minted <code>admin: true</code> custom claims and verified token emails. Client privilege escalation is blocked.
 </p>
 <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
 <CheckCircle2 className="h-4 w-4" /> Rules Deployed & Audited
 </div>
 </div>
 </div>
 </div>
 )}

 {/* ===================== TAB 2: USER ACCOUNTS ===================== */}
 {activeTab === 'users' && (
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 ">
 {/* Controls */}
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
 <div className="relative w-full sm:w-72">
 <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-600 dark:text-zinc-400" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search by email or name..."
 className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-[#111111] dark:text-white font-semibold focus:outline-none focus:border-[#FBBF24]"
 />
 </div>

 <div className="flex items-center gap-2 w-full sm:w-auto">
 <Filter className="h-4 w-4 text-[#27272A]" />
 <select
 value={roleFilter}
 onChange={(e) => setRoleFilter(e.target.value as any)}
 className="px-3 py-2 bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24]"
 >
 <option value="ALL">All Roles</option>
 <option value="client">Clients Only</option>
 <option value="supplier">Suppliers Only</option>
 <option value="admin">Administrators</option>
 </select>
 </div>
 </div>

 {/* Users Table */}
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-[#FFFFFF] dark:bg-[#111111] text-zinc-600 dark:text-zinc-400 uppercase text-[10px] font-black border-b border-zinc-200 dark:border-zinc-800">
 <tr>
 <th className="py-3 px-4">User</th>
 <th className="py-3 px-4">Email</th>
 <th className="py-3 px-4">Role</th>
 <th className="py-3 px-4">Status</th>
 <th className="py-3 px-4">Registered</th>
 <th className="py-3 px-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#27272A]">
 {filteredUsers.length === 0 ? (
 <tr>
 <td colSpan={6} className="py-8 text-center text-[#27272A]">
 No user records match your search criteria.
 </td>
 </tr>
 ) : (
 filteredUsers.map((u) => {
 const isSuspended = u.status === 'suspended' || u.status === 'disabled';
 return (
 <tr key={u.uid} className="hover:bg-white dark:bg-[#111111] dark:hover:bg-[#111111]/40 transition-colors">
 <td className="py-3.5 px-4 font-bold text-[#111111] dark:text-white">
 {u.displayName || 'No Name'}
 </td>
 <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
 <div className="flex items-center gap-1.5">
 <span>{u.email}</span>
 {u.emailVerified && (
 <span title="Verified Email">
 <CheckCircle2 className="h-3 w-3 text-emerald-500" />
 </span>
 )}
 </div>
 </td>
 <td className="py-3.5 px-4">
 <span
 className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
 u.role === 'admin'
 ? 'bg-[#FBBF24] text-[#111111]'
 : u.role === 'supplier'
 ? 'border border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
 : 'bg-neutral-100 dark:bg-[#18181B] text-[#111111] dark:text-white'
 }`}
 >
 {u.role}
 </span>
 </td>
 <td className="py-3.5 px-4">
 <span
 className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
 isSuspended
 ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
 : 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
 }`}
 >
 {u.status || 'active'}
 </span>
 </td>
 <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 text-[11px]">
 {new Date(u.createdAt).toLocaleDateString()}
 </td>
 <td className="py-3.5 px-4 text-right">
 {u.role !== 'admin' && (
 <button
 onClick={() =>
 setConfirmAction({
 type: 'toggle_user',
 id: u.uid,
 title: isSuspended ? 'Reactivate User Account?' : 'Suspend User Account?',
 description: isSuspended
 ? `Allow ${u.email} to resume signing in and transacting on Constrora.`
 : `Prevent ${u.email} from accessing platform features.`,
 newStatus: isSuspended ? 'active' : 'suspended',
 })
 }
 className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors ${
 isSuspended
 ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
 : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 border border-rose-500/30'
 }`}
 >
 {isSuspended ? 'Reactivate' : 'Suspend'}
 </button>
 )}
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* ===================== TAB 3: SUPPLIER LISTINGS ===================== */}
 {activeTab === 'listings' && (
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 ">
 {/* Controls */}
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
 <div className="relative w-full sm:w-72">
 <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-600 dark:text-zinc-400" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search listings or suppliers..."
 className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-[#111111] dark:text-white font-semibold focus:outline-none focus:border-[#FBBF24]"
 />
 </div>

 <div className="flex items-center gap-2 w-full sm:w-auto">
 <Filter className="h-4 w-4 text-[#27272A]" />
 <select
 value={listingStatusFilter}
 onChange={(e) => setListingStatusFilter(e.target.value as any)}
 className="px-3 py-2 bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24]"
 >
 <option value="ALL">All Statuses</option>
 <option value="AVAILABLE">Available</option>
 <option value="UNAVAILABLE">Rented / Out of Stock</option>
 <option value="DISABLED">Admin Disabled</option>
 </select>
 </div>
 </div>

 {/* Listings Table */}
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-[#FFFFFF] dark:bg-[#111111] text-zinc-600 dark:text-zinc-400 uppercase text-[10px] font-black border-b border-zinc-200 dark:border-zinc-800">
 <tr>
 <th className="py-3 px-4">Equipment / Material</th>
 <th className="py-3 px-4">Supplier Business</th>
 <th className="py-3 px-4">Rate</th>
 <th className="py-3 px-4">Listing Status</th>
 <th className="py-3 px-4 text-right">Moderation Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#27272A]">
 {filteredListings.length === 0 ? (
 <tr>
 <td colSpan={5} className="py-8 text-center text-[#27272A]">
 No listings match the current criteria.
 </td>
 </tr>
 ) : (
 filteredListings.map((l) => (
 <tr key={l.listingId} className="hover:bg-white dark:bg-[#111111] dark:hover:bg-[#111111]/40 transition-colors">
 <td className="py-3.5 px-4 font-bold text-[#111111] dark:text-white">
 <div>{l.title}</div>
 <div className="text-[10px] text-[#27272A] font-normal">{l.category}</div>
 </td>
 <td className="py-3.5 px-4">
 <div className="font-semibold text-[#111111] dark:text-white">{l.businessName}</div>
 <div className="text-[10px] text-zinc-600 dark:text-zinc-400">
 {l.location.city}, {l.location.state}
 </div>
 </td>
 <td className="py-3.5 px-4 font-mono font-bold text-[#F59E0B]">
 ₦{l.rate?.toLocaleString()} / {l.rateUnit}
 </td>
 <td className="py-3.5 px-4">
 <span
 className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
 l.status === 'AVAILABLE'
 ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
 : l.status === 'DISABLED'
 ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
 : 'bg-[#FBBF24]/15 text-[#F59E0B] border border-[#FBBF24]/30'
 }`}
 >
 {l.status}
 </span>
 </td>
 <td className="py-3.5 px-4 text-right space-x-2">
 <button
 onClick={() =>
 setConfirmAction({
 type: 'toggle_listing',
 id: l.listingId,
 secondaryId: l.businessId,
 title: l.status === 'DISABLED' ? 'Enable Listing?' : 'Disable Inappropriate Listing?',
 description: l.status === 'DISABLED'
 ? `Re-enable "${l.title}" so clients can discover and request quotes.`
 : `Deactivate "${l.title}" from public search and catalogs.`,
 newStatus: l.status === 'DISABLED' ? 'AVAILABLE' : 'DISABLED',
 })
 }
 className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors ${
 l.status === 'DISABLED'
 ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
 : 'bg-[#FBBF24]/15 hover:bg-[#F59E0B]/25 text-[#F59E0B] border border-[#FBBF24]/30'
 }`}
 >
 {l.status === 'DISABLED' ? 'Enable' : 'Disable'}
 </button>

 <button
 onClick={() =>
 setConfirmAction({
 type: 'delete_listing',
 id: l.listingId,
 secondaryId: l.businessId,
 title: 'Permanently Remove Listing?',
 description: `Are you sure you want to delete "${l.title}"? This cannot be undone.`,
 })
 }
 className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 border border-rose-500/30 cursor-pointer transition-colors"
 >
 Delete
 </button>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* ===================== TAB 4: VERIFICATION DESK ===================== */}
 {activeTab === 'verifications' && (
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 ">
 <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
 <h3 className="font-['Cabinet_Grotesk'] text-base font-extrabold text-[#111111] dark:text-white uppercase">
 SUPPLIER CAC VERIFICATION QUEUE
 </h3>
 <p className="text-xs text-zinc-600 dark:text-zinc-400">
 Review corporate documentation submitted by equipment rental yards and material supply depots.
 </p>
 </div>

 {pendingSuppliers.length === 0 ? (
 <div className="p-12 text-center space-y-2 bg-[#FFFFFF] dark:bg-[#111111] rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
 <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
 <h4 className="text-sm font-bold text-[#111111] dark:text-white">
 Verification Queue is Clear
 </h4>
 <p className="text-xs text-zinc-600 dark:text-zinc-400">
 All registered supplier businesses are currently reviewed and processed.
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 {pendingSuppliers.map((s) => (
 <div
 key={s.businessId}
 className="p-5 rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
 >
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <h4 className="font-black text-sm text-[#111111] dark:text-white">{s.businessName}</h4>
 <span className="text-[10px] bg-[#FBBF24]/20 text-[#F59E0B] dark:text-[#FBBF24] font-bold px-2 py-0.5 rounded">
 PENDING REVIEW
 </span>
 </div>
 <p className="text-xs text-zinc-600 dark:text-zinc-400">
 Depot: {s.location.city}, {s.location.state} · Category: {s.category}
 </p>
 <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
 Business ID: <code className="font-mono">{s.businessId}</code>
 </p>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={() =>
 setConfirmAction({
 type: 'verify_business',
 id: s.businessId,
 title: `Approve CAC Verification for ${s.businessName}?`,
 description: 'Grants the official Verified Supplier badge visible to all clients.',
 newStatus: 'VERIFIED',
 })
 }
 className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5"
 >
 <Check className="h-4 w-4" /> Approve
 </button>

 <button
 onClick={() =>
 setConfirmAction({
 type: 'verify_business',
 id: s.businessId,
 title: `Reject Verification for ${s.businessName}?`,
 description: 'The supplier will remain unverified with an alert to resubmit documents.',
 newStatus: 'REJECTED',
 })
 }
 className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30 font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5"
 >
 <X className="h-4 w-4" /> Reject
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </>
 )}

 {/* Confirmation Modal */}
 {confirmAction && (
 <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
 <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-md w-full p-6 space-y-4 ">
 <div className="flex items-center gap-3">
 <div className="p-2.5 bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-[#F59E0B] rounded-xl shrink-0">
 <AlertTriangle className="h-5 w-5" />
 </div>
 <h3 className="font-['Cabinet_Grotesk'] text-base font-black text-[#111111] dark:text-white">
 {confirmAction.title}
 </h3>
 </div>

 <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
 {confirmAction.description}
 </p>

 <div className="flex items-center gap-2 pt-2">
 <button
 type="button"
 disabled={actionLoading}
 onClick={() => setConfirmAction(null)}
 className="flex-1 py-2.5 px-4 bg-[#FFFFFF] dark:bg-[#111111] hover:bg-neutral-100 dark:bg-[#18181B] dark:hover:bg-[#111111] text-[#111111] dark:text-white border border-zinc-200 dark:border-zinc-800 font-bold text-xs rounded-xl uppercase cursor-pointer"
 >
 Cancel
 </button>

 <button
 type="button"
 disabled={actionLoading}
 onClick={() => {
 if (confirmAction.type === 'toggle_user' && confirmAction.newStatus) {
 handleExecuteUserStatus(confirmAction.id, confirmAction.newStatus);
 } else if (confirmAction.type === 'toggle_listing' && confirmAction.secondaryId && confirmAction.newStatus) {
 handleExecuteListingStatus(confirmAction.secondaryId, confirmAction.id, confirmAction.newStatus);
 } else if (confirmAction.type === 'delete_listing' && confirmAction.secondaryId) {
 handleExecuteDeleteListing(confirmAction.secondaryId, confirmAction.id);
 } else if (confirmAction.type === 'verify_business' && confirmAction.newStatus) {
 handleExecuteBusinessVerify(confirmAction.id, confirmAction.newStatus as any);
 }
 }}
 className="flex-1 py-2.5 px-4 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black text-xs rounded-xl uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5"
 >
 {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Action'}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};
