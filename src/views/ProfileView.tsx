import React, { useState, useEffect } from 'react';
import {
 User,
 Building,
 HardHat,
 LogOut,
 ArrowRight,
 FileText,
 Bookmark,
 Settings,
 HelpCircle,
 Sun,
 Moon,
 Laptop,
 CheckCircle2,
 Clock,
 ShieldCheck,
 Building2,
 Mail,
 Phone,
 MapPin,
 ChevronRight,
 Truck,
 Trash2,
 AlertTriangle,
 X,
 Loader2,
 Lock,
 Shield,
 Scale,
 Copy,
 Check,
 Edit2,
 Info,
 AlertCircle,
 Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useProject } from '../context/ProjectContext';
import { UserRole, QuoteRequest } from '../types';
import { NavTab } from '../components/BottomNav';
import { LegalModal } from '../components/LegalModal';

interface ProfileViewProps {
 onOpenAuthModal: () => void;
 onOpenSignInModal?: () => void;
 onOpenSignUpModal?: () => void;
 onNavigateTab: (tab: NavTab) => void;
 quoteRequests?: QuoteRequest[];
}

type ProfileSection = 'overview' | 'requests' | 'settings' | 'help' | 'legal';

export const ProfileView: React.FC<ProfileViewProps> = ({
 onOpenAuthModal,
 onOpenSignInModal,
 onOpenSignUpModal,
 onNavigateTab,
 quoteRequests = [],
}) => {
 const { currentUser, signOut, deleteAccount, updateUserProfile } = useAuth();
 const { theme, setTheme } = useTheme();
 const { activeProject } = useProject();

 const [activeTab, setActiveTab] = useState<ProfileSection>('overview');
 const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);

 // Edit Name State in Account Settings
 const [isEditingName, setIsEditingName] = useState(false);
 const [newName, setNewName] = useState('');
 const [savingName, setSavingName] = useState(false);
 const [nameSuccess, setNameSuccess] = useState(false);

 // Copy Email State
 const [copiedEmail, setCopiedEmail] = useState(false);

 // Account Deletion State Machine
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [deleteStep, setDeleteStep] = useState<1 | 2 | 'reauth'>(1);
 const [confirmText, setConfirmText] = useState('');
 const [reauthPassword, setReauthPassword] = useState('');
 const [deleting, setDeleting] = useState(false);
 const [deleteError, setDeleteError] = useState<string | null>(null);

 // Close modal on Escape key
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape' && showDeleteModal && !deleting) {
 setShowDeleteModal(false);
 }
 };
 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, [showDeleteModal, deleting]);

 // Sync newName when currentUser changes
 useEffect(() => {
 if (currentUser?.displayName) {
 setNewName(currentUser.displayName);
 }
 }, [currentUser?.displayName]);

 const handleCopySupportEmail = () => {
 navigator.clipboard.writeText('support@constrora.ng');
 setCopiedEmail(true);
 setTimeout(() => setCopiedEmail(false), 2000);
 };

 const handleSaveDisplayName = async () => {
 if (!newName.trim() || newName.trim() === currentUser?.displayName) {
 setIsEditingName(false);
 return;
 }
 setSavingName(true);
 try {
 await updateUserProfile({ displayName: newName.trim() });
 setIsEditingName(false);
 setNameSuccess(true);
 setTimeout(() => setNameSuccess(false), 3000);
 } catch (err) {
 console.error('Failed to update name', err);
 } finally {
 setSavingName(false);
 }
 };

 const handleStartDeleteFlow = () => {
 setShowDeleteModal(true);
 setDeleteStep(1);
 setConfirmText('');
 setReauthPassword('');
 setDeleteError(null);
 };

 const handleCancelModal = () => {
 if (deleting) return;
 setShowDeleteModal(false);
 setDeleteStep(1);
 setConfirmText('');
 setReauthPassword('');
 setDeleteError(null);
 };

 const handleExecuteDelete = async (passOverride?: string) => {
 setDeleting(true);
 setDeleteError(null);

 try {
 await deleteAccount(passOverride || (deleteStep === 'reauth' ? reauthPassword : undefined));
 setShowDeleteModal(false);
 } catch (err: any) {
 if (err?.code === 'auth/requires-recent-login' || err?.message?.includes('auth/requires-recent-login')) {
 setDeleteStep('reauth');
 setDeleteError(null);
 } else {
 setDeleteError(err?.message || 'Your account could not be deleted. Please try again.');
 }
 } finally {
 setDeleting(false);
 }
 };

 // Unauthenticated view
 if (!currentUser) {
 return (
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 text-center space-y-6 max-w-md mx-auto my-12 transition-colors ">
 <div className="h-16 w-16 bg-[#FBBF24]/20 border border-[#FBBF24]/40 text-[#111111] dark:text-[#FBBF24] rounded-lg flex items-center justify-center mx-auto ">
 <User className="h-8 w-8" />
 </div>
 <div>
 <h2 className="font-['Cabinet_Grotesk'] text-2xl font-black text-[#111111] dark:text-white uppercase tracking-tight">
 WELCOME TO CONSTRORA
 </h2>
 <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 font-medium leading-relaxed">
 Sign in with email & password or create an account to list equipment, request trade supplier quotes, or manage construction projects.
 </p>
 </div>

 <div className="space-y-3 pt-2">
 <button
 onClick={onOpenSignInModal || onOpenAuthModal}
 className="w-full bg-[#FBBF24] text-[#111111] font-black py-3.5 px-6 rounded-xl text-xs hover:bg-[#F59E0B] cursor-pointer uppercase tracking-wider transition-all "
 >
 Sign In with Email
 </button>

 <button
 onClick={onOpenSignUpModal || onOpenAuthModal}
 className="w-full bg-[#111111] hover:bg-black text-white dark:bg-[#111111] dark:hover:bg-black font-black py-3.5 px-6 rounded-xl text-xs cursor-pointer uppercase tracking-wider transition-all border border-[#111111] dark:border-[#27272A] "
 >
 Create New Account
 </button>
 </div>
 </div>
 );
 }

 const isSupplier = currentUser.role === 'supplier';

 // Navigation Items Config
 const navigationItems = [
 {
 id: 'overview' as ProfileSection,
 label: 'Overview',
 badge: null,
 icon: User,
 description: 'Account summary & quick shortcuts',
 },
 {
 id: 'requests' as ProfileSection,
 label: 'Quote Requests',
 badge: quoteRequests.length > 0 ? quoteRequests.length : null,
 icon: FileText,
 description: 'Track equipment & supply inquiries',
 },
 {
 id: 'settings' as ProfileSection,
 label: 'Account Settings',
 badge: null,
 icon: Settings,
 description: 'Profile, theme & session management',
 },
 {
 id: 'help' as ProfileSection,
 label: 'Help & Support',
 badge: null,
 icon: HelpCircle,
 description: 'Customer desk & how-to guides',
 },
 {
 id: 'legal' as ProfileSection,
 label: 'Legal',
 badge: null,
 icon: Scale,
 description: 'Terms, privacy policy & compliance',
 },
 ];

 return (
 <div className="max-w-5xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
 {/* Top Banner / Mobile Nav & Desktop Grid Wrapper */}
 <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
 
 {/* Left Column: Profile Card + Navigation Menu (Sticky on Desktop) */}
 <div className="md:col-span-4 lg:col-span-4 space-y-4">
 
 {/* User Profile Card */}
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5 transition-colors">
 <div className="flex items-center gap-3.5">
 <div className="h-14 w-14 rounded-lg bg-[#FBBF24] text-[#111111] font-black text-2xl flex items-center justify-center shrink-0">
 {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2 flex-wrap">
 <h2 className="font-['Cabinet_Grotesk'] text-lg font-black text-[#111111] dark:text-white truncate">
 {currentUser.displayName || 'Member'}
 </h2>
 </div>
 <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate font-medium mt-0.5">
 {currentUser.email}
 </p>
 <div className="mt-1.5 flex items-center gap-1.5">
 <span className="text-[10px] bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] border border-[#FBBF24]/40 font-black px-2 py-0.5 rounded uppercase">
 {currentUser.role}
 </span>
 {currentUser.emailVerified && (
 <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
 <CheckCircle2 className="h-3 w-3" /> Verified
 </span>
 )}
 </div>
 </div>
 </div>

 {/* Extra Location/Yard Info */}
 <div className="mt-4 pt-3.5 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
 {isSupplier ? (
 <div className="flex items-center gap-1.5 font-medium">
 <Building2 className="h-3.5 w-3.5 text-[#F59E0B] shrink-0" />
 <span className="truncate">Supplier Yard: <strong className="text-[#111111] dark:text-white">Osogbo Industrial Zone</strong></span>
 </div>
 ) : activeProject ? (
 <div className="flex items-center gap-1.5 font-medium">
 <MapPin className="h-3.5 w-3.5 text-[#F59E0B] shrink-0" />
 <span className="truncate">Site: <strong className="text-[#111111] dark:text-white">{activeProject.name}</strong> ({activeProject.location.city})</span>
 </div>
 ) : (
 <div className="flex items-center gap-1.5 font-medium">
 <MapPin className="h-3.5 w-3.5 text-[#27272A] shrink-0" />
 <span>Nigeria · West Africa Market</span>
 </div>
 )}
 </div>
 </div>

 {/* Navigation Menu (Desktop Vertical Menu) */}
 <div className="hidden md:block rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-3 space-y-1">
 <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
 Navigation
 </div>
 {navigationItems.map((item) => {
 const Icon = item.icon;
 const isActive = activeTab === item.id;
 return (
 <button
 key={item.id}
 onClick={() => setActiveTab(item.id)}
 className={`w-full flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer text-left ${
 isActive
 ? 'bg-[#FBBF24] text-[#111111] font-black '
 : 'hover:bg-[#FFFFFF] dark:hover:bg-[#111111] text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white font-bold'
 }`}
 >
 <div className="flex items-center gap-3">
 <div
 className={`p-2 rounded-xl transition-colors ${
 isActive
 ? 'bg-[#111111] text-[#FBBF24]'
 : 'bg-[#FFFFFF] dark:bg-[#111111] text-zinc-600 dark:text-zinc-400'
 }`}
 >
 <Icon className="h-4 w-4" />
 </div>
 <div>
 <div className="text-xs">{item.label}</div>
 <div className={`text-[10px] font-normal ${isActive ? 'text-[#111111]/80' : 'text-zinc-600 dark:text-zinc-400'}`}>
 {item.description}
 </div>
 </div>
 </div>
 {item.badge !== null && (
 <span
 className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
 isActive
 ? 'bg-[#111111] text-[#FBBF24]'
 : 'bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] border border-[#FBBF24]/40'
 }`}
 >
 {item.badge}
 </span>
 )}
 </button>
 );
 })}

 {/* Quick Sign Out Action */}
 <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800">
 <button
 type="button"
 onClick={signOut}
 className="w-full flex items-center gap-2.5 p-3 rounded-lg hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors cursor-pointer"
 >
 <LogOut className="h-4 w-4" />
 <span>Sign Out</span>
 </button>
 </div>
 </div>

 {/* Mobile Tab Pills Bar (Horizontal Scrollable Grid on Small Screens) */}
 <div className="md:hidden rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-1.5 overflow-x-auto">
 <div className="flex items-center gap-1 min-w-max">
 {navigationItems.map((item) => {
 const Icon = item.icon;
 const isActive = activeTab === item.id;
 return (
 <button
 key={item.id}
 onClick={() => setActiveTab(item.id)}
 className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
 isActive
 ? 'bg-[#FBBF24] text-[#111111] '
 : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white'
 }`}
 >
 <Icon className="h-3.5 w-3.5" />
 <span>{item.label}</span>
 {item.badge !== null && (
 <span className="text-[9px] bg-[#111111] text-[#FBBF24] px-1.5 py-0.2 rounded-full">
 {item.badge}
 </span>
 )}
 </button>
 );
 })}
 </div>
 </div>
 </div>

 {/* Right Column: Tab Content Area */}
 <div className="md:col-span-8 lg:col-span-8 space-y-6">

 {/* ===================== OVERVIEW TAB ===================== */}
 {activeTab === 'overview' && (
 <div className="space-y-6">
 
 {/* Welcome & Role Summary Card */}
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <span className="text-[10px] font-black uppercase tracking-wider text-[#F59E0B]">
 Constrora Hub
 </span>
 <h3 className="font-['Cabinet_Grotesk'] text-xl font-black text-[#111111] dark:text-white">
 Welcome back, {currentUser.displayName}
 </h3>
 <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
 You are currently operating in <strong className="text-[#111111] dark:text-white uppercase">{currentUser.role} mode</strong>.
 </p>
 </div>
 </div>

 <div className="p-3.5 rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <Info className="h-4 w-4 text-[#F59E0B] shrink-0" />
 <span>
 {currentUser.role === 'supplier'
 ? 'Suppliers can advertise plant machinery, building supplies, and quote for client jobs.'
 : 'Clients can browse verified suppliers, hire excavators & tippers, and compare formal RFQs.'}
 </span>
 </div>
 </div>
 </div>

 {/* Core Operations Grid */}
 <div>
 <h4 className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 tracking-wider mb-3 px-1">
 Quick Actions & Portals
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
 {isSupplier ? (
 <>
 <button
 onClick={() => onNavigateTab('supplier')}
 className="p-5 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 hover:border-[#FBBF24] transition-all text-left space-y-2 cursor-pointer group"
 >
 <div className="flex items-center justify-between">
 <div className="h-10 w-10 rounded-xl bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] flex items-center justify-center group-hover:scale-105 transition-transform">
 <Truck className="h-5 w-5 text-[#F59E0B]" />
 </div>
 <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400 group-hover:ml-0.5 transition-transform" />
 </div>
 <h4 className="font-extrabold text-sm text-[#111111] dark:text-white">
 My Fleet & Listings
 </h4>
 <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
 Manage machinery rentals, building material inventory, and daily rental rates.
 </p>
 </button>

 <button
 onClick={() => onNavigateTab('quotes')}
 className="p-5 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 hover:border-[#FBBF24] transition-all text-left space-y-2 cursor-pointer group"
 >
 <div className="flex items-center justify-between">
 <div className="h-10 w-10 rounded-xl bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] flex items-center justify-center group-hover:scale-105 transition-transform">
 <FileText className="h-5 w-5 text-[#F59E0B]" />
 </div>
 <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400 group-hover:ml-0.5 transition-transform" />
 </div>
 <h4 className="font-extrabold text-sm text-[#111111] dark:text-white">
 Received Quote Requests
 </h4>
 <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
 Review client inquiries, send formal PDF quotations, and confirm delivery dates.
 </p>
 </button>
 </>
 ) : (
 <>
 <button
 onClick={() => onNavigateTab('projects')}
 className="p-5 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 hover:border-[#FBBF24] transition-all text-left space-y-2 cursor-pointer group"
 >
 <div className="flex items-center justify-between">
 <div className="h-10 w-10 rounded-xl bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] flex items-center justify-center group-hover:scale-105 transition-transform">
 <HardHat className="h-5 w-5 text-[#F59E0B]" />
 </div>
 <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400 group-hover:ml-0.5 transition-transform" />
 </div>
 <h4 className="font-extrabold text-sm text-[#111111] dark:text-white">
 My Construction Projects
 </h4>
 <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
 Set construction site addresses and discover nearby plant machinery & bulk materials.
 </p>
 </button>

 <button
 onClick={() => onNavigateTab('saved')}
 className="p-5 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 hover:border-[#FBBF24] transition-all text-left space-y-2 cursor-pointer group"
 >
 <div className="flex items-center justify-between">
 <div className="h-10 w-10 rounded-xl bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] flex items-center justify-center group-hover:scale-105 transition-transform">
 <Bookmark className="h-5 w-5 text-[#F59E0B]" />
 </div>
 <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400 group-hover:ml-0.5 transition-transform" />
 </div>
 <h4 className="font-extrabold text-sm text-[#111111] dark:text-white">
 Saved Resources Binder
 </h4>
 <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
 Bookmark excavators, concrete mixers, cement suppliers and tipper haulage.
 </p>
 </button>
 </>
 )}
 </div>
 </div>

 {/* Fast Jump Grid to Settings, Support & Legal */}
 <div>
 <h4 className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 tracking-wider mb-3 px-1">
 Manage Account & Platform
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <button
 onClick={() => setActiveTab('settings')}
 className="p-4 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 hover:border-[#FBBF24] text-left space-y-1.5 transition-all cursor-pointer "
 >
 <Settings className="h-5 w-5 text-[#F59E0B]" />
 <div className="font-extrabold text-xs text-[#111111] dark:text-white">Account Settings</div>
 <div className="text-[11px] text-zinc-600 dark:text-zinc-400">Display name, theme & credentials</div>
 </button>

 <button
 onClick={() => setActiveTab('help')}
 className="p-4 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 hover:border-[#FBBF24] text-left space-y-1.5 transition-all cursor-pointer "
 >
 <HelpCircle className="h-5 w-5 text-[#F59E0B]" />
 <div className="font-extrabold text-xs text-[#111111] dark:text-white">Help & Support</div>
 <div className="text-[11px] text-zinc-600 dark:text-zinc-400">Contact desk & how-to guides</div>
 </button>

 <button
 onClick={() => setActiveTab('legal')}
 className="p-4 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 hover:border-[#FBBF24] text-left space-y-1.5 transition-all cursor-pointer "
 >
 <Scale className="h-5 w-5 text-[#F59E0B]" />
 <div className="font-extrabold text-xs text-[#111111] dark:text-white">Legal & Compliance</div>
 <div className="text-[11px] text-zinc-600 dark:text-zinc-400">Terms, privacy & disclosures</div>
 </button>
 </div>
 </div>

 </div>
 )}

 {/* ===================== QUOTE REQUESTS TAB ===================== */}
 {activeTab === 'requests' && (
 <div className="space-y-6">
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 ">
 <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
 <div className="flex items-center gap-2.5">
 <div className="p-2 rounded-xl bg-[#FBBF24]/20 text-[#F59E0B]">
 <FileText className="h-5 w-5" />
 </div>
 <div>
 <h3 className="font-['Cabinet_Grotesk'] text-base font-extrabold text-[#111111] dark:text-white uppercase">
 My Quote Requests
 </h3>
 <p className="text-xs text-zinc-600 dark:text-zinc-400">
 Direct inquiries sent to equipment and material suppliers
 </p>
 </div>
 </div>
 <span className="text-xs bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] border border-[#FBBF24]/40 font-black px-2.5 py-1 rounded-full">
 {quoteRequests.length} Total
 </span>
 </div>

 {quoteRequests.length === 0 ? (
 <div className="p-10 text-center space-y-3 bg-[#FFFFFF] dark:bg-[#111111] rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
 <FileText className="h-10 w-10 text-zinc-600 dark:text-zinc-400 mx-auto opacity-70" />
 <h4 className="text-sm font-extrabold text-[#111111] dark:text-white">
 No Quote Requests Sent Yet
 </h4>
 <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
 When you request daily plant equipment rentals or bulk material delivery quotes, your inquiries and supplier responses will be tracked here.
 </p>
 <button
 onClick={() => onNavigateTab('search')}
 className="px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all "
 >
 Browse Equipment Catalog
 </button>
 </div>
 ) : (
 <div className="space-y-3">
 {quoteRequests.map((req) => (
 <div
 key={req.quoteRequestId}
 className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-2"
 >
 <div className="flex items-center justify-between text-xs font-bold">
 <span className="text-[#111111] dark:text-white font-black text-sm">{req.itemName}</span>
 <span className="bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] border border-[#FBBF24]/40 px-2.5 py-0.5 rounded text-[10px] uppercase font-black">
 {req.status}
 </span>
 </div>
 <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
 <span>Site: <strong className="text-[#111111] dark:text-white">{req.projectName}</strong></span>
 <span>·</span>
 <span>Quantity: <strong className="text-[#111111] dark:text-white">{req.quantity}</strong></span>
 </div>
 <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-semibold">
 Created: {new Date(req.createdAt).toLocaleDateString()}
 </p>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}

 {/* ===================== ACCOUNT SETTINGS SECTION ===================== */}
 {activeTab === 'settings' && (
 <div className="space-y-6">
 
 {/* Section Header */}
 <div className="flex items-center gap-3 px-1">
 <div className="p-2.5 rounded-lg bg-[#FBBF24]/20 border border-[#FBBF24]/40 text-[#F59E0B]">
 <Settings className="h-6 w-6" />
 </div>
 <div>
 <h3 className="font-['Cabinet_Grotesk'] text-xl font-black text-[#111111] dark:text-white uppercase tracking-tight">
 Account Settings
 </h3>
 <p className="text-xs text-zinc-600 dark:text-zinc-400">
 Manage your profile credentials, platform role, theme appearance, and data security.
 </p>
 </div>
 </div>

 {/* Card 1: Account Profile & Identity */}
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 ">
 <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
 <div className="flex items-center gap-2">
 <User className="h-5 w-5 text-[#F59E0B]" />
 <h4 className="font-['Cabinet_Grotesk'] text-base font-extrabold text-[#111111] dark:text-white">
 PROFILE & CREDENTIALS
 </h4>
 </div>
 {nameSuccess && (
 <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
 <Check className="h-3.5 w-3.5" /> Updated successfully!
 </span>
 )}
 </div>

 <div className="space-y-3 text-xs">
 {/* Display Name */}
 <div className="p-4 bg-[#FFFFFF] dark:bg-[#111111] rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <span className="text-zinc-600 dark:text-zinc-400 font-medium block text-[11px]">
 Display Name
 </span>
 {isEditingName ? (
 <div className="flex items-center gap-2 mt-1">
 <input
 type="text"
 value={newName}
 onChange={(e) => setNewName(e.target.value)}
 className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-[#111111] dark:text-white font-bold focus:outline-none focus:border-[#FBBF24]"
 placeholder="Enter your name"
 />
 <button
 disabled={savingName}
 onClick={handleSaveDisplayName}
 className="px-3 py-1.5 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-bold text-xs rounded-lg uppercase cursor-pointer"
 >
 {savingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
 </button>
 <button
 onClick={() => {
 setIsEditingName(false);
 setNewName(currentUser.displayName || '');
 }}
 className="px-3 py-1.5 bg-neutral-100 dark:bg-[#18181B] dark:bg-[#27272A] text-[#111111] dark:text-white font-bold text-xs rounded-lg uppercase cursor-pointer"
 >
 Cancel
 </button>
 </div>
 ) : (
 <span className="font-extrabold text-[#111111] dark:text-white text-sm">
 {currentUser.displayName || 'No Name Set'}
 </span>
 )}
 </div>
 {!isEditingName && (
 <button
 onClick={() => setIsEditingName(true)}
 className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-[#111111] dark:text-white hover:border-[#FBBF24] cursor-pointer"
 >
 <Edit2 className="h-3 w-3 text-[#F59E0B]" />
 <span>Edit Name</span>
 </button>
 )}
 </div>

 {/* Email Address */}
 <div className="p-4 bg-[#FFFFFF] dark:bg-[#111111] rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
 <div>
 <span className="text-zinc-600 dark:text-zinc-400 font-medium block text-[11px]">
 Email Address
 </span>
 <span className="font-extrabold text-[#111111] dark:text-white text-sm">
 {currentUser.email}
 </span>
 </div>
 <div className="flex items-center gap-1.5">
 {currentUser.emailVerified ? (
 <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded flex items-center gap-1">
 <CheckCircle2 className="h-3 w-3" /> Verified
 </span>
 ) : (
 <span className="text-[10px] bg-[#FBBF24]/10 text-[#F59E0B] dark:text-[#FBBF24] border border-[#FBBF24]/30 font-bold px-2 py-0.5 rounded">
 Unverified
 </span>
 )}
 </div>
 </div>

 {/* Account Role Card */}
 <div className="p-4 bg-[#FFFFFF] dark:bg-[#111111] rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <div>
 <span className="text-zinc-600 dark:text-zinc-400 font-medium block text-[11px]">
 Account Role
 </span>
 <div className="flex items-center gap-2 mt-0.5">
 <span className="font-black text-sm text-[#111111] dark:text-[#FBBF24] uppercase">
 {currentUser.role}
 </span>
 <span className="text-[10px] text-zinc-600 dark:text-zinc-400">
 ({currentUser.role === 'supplier' ? 'Verified Trade & Equipment Supplier' : 'Client & Construction Builder'})
 </span>
 </div>
 </div>
 <span className="self-start sm:self-auto text-[10px] bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] border border-[#FBBF24]/40 font-black px-2.5 py-1 rounded uppercase">
 ASSIGNED
 </span>
 </div>
 </div>
 </div>

 {/* Card 2: Appearance & Theme Preferences */}
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 ">
 <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
 <Sun className="h-5 w-5 text-[#F59E0B]" />
 <h4 className="font-['Cabinet_Grotesk'] text-base font-extrabold text-[#111111] dark:text-white">
 APPEARANCE & THEME
 </h4>
 </div>
 <p className="text-xs text-zinc-600 dark:text-zinc-400">
 Customize how Constrora looks across your desktop and mobile browsers.
 </p>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
 <button
 type="button"
 onClick={() => setTheme('light')}
 className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-2.5 font-black cursor-pointer transition-all ${
 theme === 'light'
 ? 'bg-[#FBBF24] text-[#111111] border-[#FBBF24] ring-2 ring-[#FBBF24]/30'
 : 'bg-[#FFFFFF] dark:bg-[#111111] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white'
 }`}
 >
 <Sun className="h-6 w-6" />
 <span>LIGHT MODE</span>
 <span className="text-[10px] font-normal opacity-80">Clean daytime view</span>
 </button>

 <button
 type="button"
 onClick={() => setTheme('dark')}
 className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-2.5 font-black cursor-pointer transition-all ${
 theme === 'dark'
 ? 'bg-[#FBBF24] text-[#111111] border-[#FBBF24] ring-2 ring-[#FBBF24]/30'
 : 'bg-[#FFFFFF] dark:bg-[#111111] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white'
 }`}
 >
 <Moon className="h-6 w-6" />
 <span>DARK MODE</span>
 <span className="text-[10px] font-normal opacity-80">High-contrast night view</span>
 </button>

 <button
 type="button"
 onClick={() => setTheme('system')}
 className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-2.5 font-black cursor-pointer transition-all ${
 theme === 'system'
 ? 'bg-[#FBBF24] text-[#111111] border-[#FBBF24] ring-2 ring-[#FBBF24]/30'
 : 'bg-[#FFFFFF] dark:bg-[#111111] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-[#111111] dark:hover:text-white'
 }`}
 >
 <Laptop className="h-6 w-6" />
 <span>SYSTEM DEFAULT</span>
 <span className="text-[10px] font-normal opacity-80">Sync with device OS</span>
 </button>
 </div>
 </div>

 {/* Card 3: Security & Session Actions */}
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 ">
 <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
 <Lock className="h-5 w-5 text-[#F59E0B]" />
 <h4 className="font-['Cabinet_Grotesk'] text-base font-extrabold text-[#111111] dark:text-white">
 SECURITY & SESSION MANAGEMENT
 </h4>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
 <div>
 <h5 className="font-bold text-xs text-[#111111] dark:text-white">
 Active Session
 </h5>
 <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
 Sign out of Constrora on this device. Your data remains stored safely in the cloud.
 </p>
 </div>
 <button
 type="button"
 onClick={signOut}
 className="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] hover:bg-neutral-100 dark:bg-[#18181B] dark:hover:bg-[#111111] text-[#111111] dark:text-white text-xs font-black transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 "
 >
 <LogOut className="h-4 w-4 text-[#F59E0B]" />
 <span>SIGN OUT</span>
 </button>
 </div>

 {/* Danger Zone */}
 <div className="p-4 rounded-lg bg-rose-500/5 border border-rose-500/20 space-y-3 flex flex-col justify-between">
 <div>
 <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-extrabold text-xs">
 <AlertTriangle className="h-4 w-4" />
 <span>DANGER ZONE</span>
 </div>
 <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
 Permanently delete your user credentials, uploaded business listings, and quote history.
 </p>
 </div>
 <button
 type="button"
 onClick={handleStartDeleteFlow}
 className="w-full py-3 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
 >
 <Trash2 className="h-4 w-4 text-rose-500" />
 <span>DELETE ACCOUNT DATA</span>
 </button>
 </div>
 </div>
 </div>

 </div>
 )}

 {/* ===================== HELP & SUPPORT SECTION ===================== */}
 {activeTab === 'help' && (
 <div className="space-y-6">
 
 {/* Section Header */}
 <div className="flex items-center gap-3 px-1">
 <div className="p-2.5 rounded-lg bg-[#FBBF24]/20 border border-[#FBBF24]/40 text-[#F59E0B]">
 <HelpCircle className="h-6 w-6" />
 </div>
 <div>
 <h3 className="font-['Cabinet_Grotesk'] text-xl font-black text-[#111111] dark:text-white uppercase tracking-tight">
 Help & Support
 </h3>
 <p className="text-xs text-zinc-600 dark:text-zinc-400">
 Reach our customer desk, learn about supplier verification, and view construction safety guides.
 </p>
 </div>
 </div>

 {/* Card 1: Direct Support Desk */}
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 ">
 <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
 <div className="flex items-center gap-2">
 <Mail className="h-5 w-5 text-[#F59E0B]" />
 <h4 className="font-['Cabinet_Grotesk'] text-base font-extrabold text-[#111111] dark:text-white">
 CONSTRORA CUSTOMER DESK
 </h4>
 </div>
 <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded flex items-center gap-1">
 <Clock className="h-3 w-3" /> Replies &lt; 24h
 </span>
 </div>

 <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
 Have questions regarding machinery rentals, supplier CAC business verification, equipment pricing, or requesting custom site quotes? Our dedicated support team is available to assist you.
 </p>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <a
 href="mailto:support@constrora.ng"
 className="flex items-center justify-between p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 hover:border-[#FBBF24] transition-colors group cursor-pointer"
 >
 <div className="flex items-center gap-3">
 <div className="p-2.5 rounded-xl bg-[#FBBF24]/20 text-[#F59E0B]">
 <Mail className="h-4 w-4" />
 </div>
 <div>
 <div className="text-xs font-black text-[#111111] dark:text-white group-hover:text-[#F59E0B] transition-colors">
 Send Support Email
 </div>
 <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
 support@constrora.ng
 </div>
 </div>
 </div>
 <ChevronRight className="h-4 w-4 text-[#27272A] group-hover:ml-0.5 transition-transform" />
 </a>

 <button
 type="button"
 onClick={handleCopySupportEmail}
 className="flex items-center justify-between p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 hover:border-[#FBBF24] transition-colors cursor-pointer text-left"
 >
 <div className="flex items-center gap-3">
 <div className="p-2.5 rounded-xl bg-[#FBBF24]/20 text-[#F59E0B]">
 {copiedEmail ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
 </div>
 <div>
 <div className="text-xs font-black text-[#111111] dark:text-white">
 {copiedEmail ? 'Copied to Clipboard!' : 'Copy Support Email'}
 </div>
 <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
 Click to copy email address
 </div>
 </div>
 </div>
 <Copy className="h-4 w-4 text-[#27272A]" />
 </button>
 </div>
 </div>

 {/* Card 2: How-To Guides Grid */}
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 ">
 <h4 className="font-['Cabinet_Grotesk'] text-base font-extrabold text-[#111111] dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-3">
 PLATFORM HOW-TO & USER GUIDES
 </h4>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
 <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-2">
 <div className="font-extrabold text-[#111111] dark:text-white flex items-center gap-2">
 <HardHat className="h-4 w-4 text-[#F59E0B]" />
 <span>How to Request Quotes</span>
 </div>
 <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
 Select any listing from our catalog, specify your site location and required hire dates, and submit an RFQ. Verified suppliers will respond with formal itemized quotations.
 </p>
 </div>

 <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-2">
 <div className="font-extrabold text-[#111111] dark:text-white flex items-center gap-2">
 <ShieldCheck className="h-4 w-4 text-[#F59E0B]" />
 <span>Supplier Verification & Badges</span>
 </div>
 <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
 Registered businesses can submit Corporate Affairs Commission (CAC) proof for admin review to earn the Verified Supplier badge and boost client trust.
 </p>
 </div>

 <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-2">
 <div className="font-extrabold text-[#111111] dark:text-white flex items-center gap-2">
 <Truck className="h-4 w-4 text-[#F59E0B]" />
 <span>Machinery Inspection Checklist</span>
 </div>
 <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
 We advise clients to inspect machinery operating hours, maintenance logs, and site access clearances before signing off on equipment hire delivery receipts.
 </p>
 </div>

 <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-2">
 <div className="font-extrabold text-[#111111] dark:text-white flex items-center gap-2">
 <Building className="h-4 w-4 text-[#F59E0B]" />
 <span>Off-Platform Payment Safety</span>
 </div>
 <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
 Constrora is a neutral introduction facilitator and does not process payments directly. Always use written service agreements and verify bank accounts with suppliers directly.
 </p>
 </div>
 </div>
 </div>

 {/* Card 3: System Status & Version */}
 <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
 <div className="flex items-center gap-2 font-bold text-[#111111] dark:text-white">
 <div className="h-2 w-2 rounded-full bg-emerald-500 " />
 <span>CONSTRORA PLATFORM v1.2</span>
 <span className="text-zinc-600 dark:text-zinc-400 font-normal">· All Systems Operational</span>
 </div>
 <div>West Africa Construction Tech Hub · Buildsafe 24/7</div>
 </div>

 </div>
 )}

 {/* ===================== LEGAL SECTION ===================== */}
 {activeTab === 'legal' && (
 <div className="space-y-6">
 
 {/* Section Header */}
 <div className="flex items-center gap-3 px-1">
 <div className="p-2.5 rounded-lg bg-[#FBBF24]/20 border border-[#FBBF24]/40 text-[#F59E0B]">
 <Scale className="h-6 w-6" />
 </div>
 <div>
 <h3 className="font-['Cabinet_Grotesk'] text-xl font-black text-[#111111] dark:text-white uppercase tracking-tight">
 Legal & Compliance
 </h3>
 <p className="text-xs text-zinc-600 dark:text-zinc-400">
 Review Constrora's binding terms of service, platform disclaimers, and user privacy protections.
 </p>
 </div>
 </div>

 {/* Card 1: Official Documents Grid */}
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 ">
 <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
 <h4 className="font-['Cabinet_Grotesk'] text-base font-extrabold text-[#111111] dark:text-white">
 BINDING LEGAL DOCUMENTS
 </h4>
 <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
 Click any document below to inspect the complete terms, policies, and regulatory disclosures.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Terms & Conditions Card */}
 <div className="p-5 rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:border-[#FBBF24] transition-colors">
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <div className="p-2.5 rounded-xl bg-[#FBBF24]/20 text-[#F59E0B]">
 <FileText className="h-5 w-5" />
 </div>
 <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
 Updated Sept 12, 2026
 </span>
 </div>
 <h5 className="font-['Cabinet_Grotesk'] text-base font-black text-[#111111] dark:text-white">
 Terms & Conditions
 </h5>
 <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
 Covers our facilitator marketplace model, user rights, off-platform payment disclaimers, IP licensing for uploads, and dispute resolution guidelines.
 </p>
 </div>

 <button
 type="button"
 onClick={() => setLegalModalType('terms')}
 className="w-full py-3 px-4 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black text-xs transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 "
 >
 <span>Read Terms & Conditions</span>
 <ArrowRight className="h-3.5 w-3.5" />
 </button>
 </div>

 {/* Privacy Policy Card */}
 <div className="p-5 rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:border-[#FBBF24] transition-colors">
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <div className="p-2.5 rounded-xl bg-[#FBBF24]/20 text-[#F59E0B]">
 <Shield className="h-5 w-5" />
 </div>
 <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
 Updated Sept 12, 2026
 </span>
 </div>
 <h5 className="font-['Cabinet_Grotesk'] text-base font-black text-[#111111] dark:text-white">
 Privacy Policy
 </h5>
 <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
 Discloses personal data collection, Firebase & Google Cloud infrastructure subprocessors, public business listings vs private accounts, and your GDPR/NDPR rights.
 </p>
 </div>

 <button
 type="button"
 onClick={() => setLegalModalType('privacy')}
 className="w-full py-3 px-4 rounded-xl bg-[#111111] hover:bg-black text-white dark:bg-[#18181B] dark:hover:bg-[#111111] font-black text-xs border border-[#111111] dark:border-[#27272A] transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 "
 >
 <span>Read Privacy Policy</span>
 <ArrowRight className="h-3.5 w-3.5" />
 </button>
 </div>
 </div>
 </div>

 {/* Card 2: Marketplace Facilitator Notice */}
 <div className="rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 text-xs">
 <div className="flex items-center gap-2.5 border-b border-zinc-200 dark:border-zinc-800 pb-3">
 <ShieldCheck className="h-5 w-5 text-[#F59E0B]" />
 <h4 className="font-['Cabinet_Grotesk'] text-base font-extrabold text-[#111111] dark:text-white">
 MARKETPLACE FACILITATOR NOTICE
 </h4>
 </div>

 <div className="space-y-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
 <p>
 <strong className="text-[#111111] dark:text-white">Venue Model:</strong> Constrora operates purely as an online technology platform connecting independent trade suppliers, machinery rental owners, and construction material vendors with clients. Constrora is not a general contractor, employer, broker, or direct party to any construction or equipment supply agreement.
 </p>
 <p>
 <strong className="text-[#111111] dark:text-white">Off-Platform Payments:</strong> Constrora does not process, handle, or escrow construction project payments on-platform. Any financial transactions, quotes, deposits, or milestone payments are negotiated and executed directly between the client and supplier.
 </p>
 <p>
 <strong className="text-[#111111] dark:text-white">Verification Badges:</strong> The"Verified Supplier" badge signifies basic validation of company documentation (such as CAC business registration). It does not constitute an endorsement, insurance warranty, or structural engineering guarantee of workmanship quality.
 </p>
 </div>
 </div>

 {/* Card 3: Data Rights & Compliance Summary */}
 <div className="rounded-lg bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 p-5 space-y-3 text-xs">
 <h5 className="font-extrabold text-[#111111] dark:text-white flex items-center gap-2">
 <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
 <span>Your Data Protection Rights</span>
 </h5>
 <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
 Under applicable data protection frameworks (including the Nigeria Data Protection Act and GDPR principles), you have the right to inspect, update, or permanently delete your account data. You can exercise account deletion at any time directly under <button onClick={() => setActiveTab('settings')} className="text-[#F59E0B] font-bold hover:underline cursor-pointer">Account Settings</button> or by contacting <a href="mailto:support@constrora.ng" className="text-[#F59E0B] font-bold hover:underline">support@constrora.ng</a>.
 </p>
 </div>

 </div>
 )}

 </div>
 </div>

 {/* LEGAL DOCUMENT MODAL */}
 <LegalModal
 type={legalModalType}
 onClose={() => setLegalModalType(null)}
 />

 {/* DELETE ACCOUNT CONFIRMATION MODALS */}
 {showDeleteModal && (
 <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
 <div className="bg-white dark:bg-[#18181B] border border-rose-500/40 rounded-lg max-w-md w-full p-6 space-y-5 text-left relative">
 <button
 onClick={handleCancelModal}
 disabled={deleting}
 className="absolute top-5 right-5 text-[#27272A] hover:text-[#111111] dark:text-[#E5E5E5] dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
 aria-label="Close modal"
 >
 <X className="h-5 w-5" />
 </button>

 {/* FIRST WARNING MODAL */}
 {deleteStep === 1 && (
 <div className="space-y-4">
 <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
 <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl shrink-0">
 <AlertTriangle className="h-5 w-5" />
 </div>
 <div>
 <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-[#111111] dark:text-white">
 Delete your account?
 </h3>
 </div>
 </div>

 <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
 Deleting your account is permanent. Your account profile, equipment listings, and quote history will be removed and you will be signed out immediately.
 </p>

 {deleteError && (
 <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-semibold">
 {deleteError}
 </div>
 )}

 <div className="flex items-center gap-2.5 pt-2">
 <button
 type="button"
 onClick={handleCancelModal}
 className="flex-1 py-3 px-4 bg-[#FFFFFF] dark:bg-[#111111] hover:bg-neutral-100 dark:bg-[#18181B] dark:hover:bg-[#18181B] text-[#111111] dark:text-white border border-zinc-200 dark:border-zinc-800 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase"
 >
 CANCEL
 </button>

 <button
 type="button"
 onClick={() => setDeleteStep(2)}
 className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-all cursor-pointer uppercase "
 >
 CONTINUE
 </button>
 </div>
 </div>
 )}

 {/* SECOND WARNING MODAL */}
 {deleteStep === 2 && (
 <div className="space-y-4">
 <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
 <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl shrink-0">
 <AlertTriangle className="h-5 w-5" />
 </div>
 <div>
 <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-[#111111] dark:text-white">
 Are you absolutely sure?
 </h3>
 </div>
 </div>

 <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
 <p className="leading-relaxed">
 This action cannot be undone.
 </p>
 <p className="leading-relaxed text-[#111111] dark:text-white font-semibold">
 Your CONSTRORA account will be permanently deleted. You will lose access to your profile, saved resources, quote requests, business information, and listings.
 </p>

 <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1.5 text-[11px] text-rose-700 dark:text-rose-200 font-medium">
 <span className="font-black uppercase text-rose-600 dark:text-rose-400 block">
 {isSupplier ? 'DATA TO BE REMOVED (SUPPLIER ACCOUNT)' : 'DATA TO BE REMOVED (CLIENT ACCOUNT)'}
 </span>
 {isSupplier ? (
 <ul className="list-disc list-inside space-y-0.5 text-zinc-600 dark:text-zinc-400">
 <li>Business profile & CAC verification info</li>
 <li>Equipment & material listings</li>
 <li>Supplier quote history & received requests</li>
 <li>Saved data & supplier information</li>
 </ul>
 ) : (
 <ul className="list-disc list-inside space-y-0.5 text-zinc-600 dark:text-zinc-400">
 <li>Client profile information</li>
 <li>Saved listings & binder items</li>
 <li>Construction project site addresses</li>
 <li>Quote requests & account data</li>
 </ul>
 )}
 </div>
 </div>

 {/* Mandatory Type DELETE Confirmation */}
 <div className="space-y-1.5 pt-1">
 <label htmlFor="delete-confirm-input" className="text-xs font-bold text-[#111111] dark:text-white block">
 Type <strong className="text-rose-500">DELETE</strong> to confirm
 </label>
 <input
 id="delete-confirm-input"
 type="text"
 value={confirmText}
 onChange={(e) => setConfirmText(e.target.value)}
 placeholder="DELETE"
 disabled={deleting}
 className="w-full bg-[#FFFFFF] dark:bg-[#111111] border border-rose-500/40 rounded-xl px-3.5 py-2.5 text-[#111111] dark:text-white font-black text-xs uppercase tracking-widest focus:outline-none focus:border-rose-500 placeholder:normal-case placeholder:font-normal placeholder:text-[#27272A]"
 />
 </div>

 {deleteError && (
 <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-semibold space-y-2">
 <p>{deleteError}</p>
 <div className="flex gap-2 pt-1">
 <button
 type="button"
 onClick={() => handleExecuteDelete()}
 className="px-3 py-1.5 bg-rose-600 text-white font-bold text-[11px] rounded-lg uppercase cursor-pointer"
 >
 TRY AGAIN
 </button>
 <button
 type="button"
 onClick={handleCancelModal}
 className="px-3 py-1.5 bg-[#FFFFFF] dark:bg-[#111111] text-[#111111] dark:text-white border border-zinc-200 dark:border-zinc-800 font-bold text-[11px] rounded-lg uppercase cursor-pointer"
 >
 CANCEL
 </button>
 </div>
 </div>
 )}

 <div className="flex items-center gap-2.5 pt-2">
 <button
 type="button"
 onClick={() => setDeleteStep(1)}
 disabled={deleting}
 className="flex-1 py-3 px-4 bg-[#FFFFFF] dark:bg-[#111111] hover:bg-neutral-100 dark:bg-[#18181B] dark:hover:bg-[#18181B] text-[#111111] dark:text-white border border-zinc-200 dark:border-zinc-800 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase"
 >
 GO BACK
 </button>

 <button
 type="button"
 onClick={() => handleExecuteDelete()}
 disabled={confirmText !== 'DELETE' || deleting}
 className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:bg-[#E5E5E5] dark:disabled:bg-[#18181B] disabled:text-[#27272A] dark:disabled:text-[#27272A] disabled:border-transparent text-white font-black text-xs rounded-xl transition-all cursor-pointer uppercase flex items-center justify-center gap-2 "
 >
 {deleting ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" /> Deleting your account...
 </>
 ) : (
 <>
 <Trash2 className="h-4 w-4" /> YES, DELETE MY ACCOUNT
 </>
 )}
 </button>
 </div>
 </div>
 )}

 {/* REAUTHENTICATION MODAL */}
 {deleteStep === 'reauth' && (
 <div className="space-y-4">
 <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
 <div className="p-2.5 bg-[#FBBF24]/20 border border-[#FBBF24]/40 text-[#111111] dark:text-[#FBBF24] rounded-xl shrink-0">
 <Lock className="h-5 w-5 text-[#F59E0B]" />
 </div>
 <div>
 <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-[#111111] dark:text-white">
 CONFIRM YOUR PASSWORD
 </h3>
 </div>
 </div>

 <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
 For security, please enter your password before deleting your account.
 </p>

 <div className="space-y-1.5">
 <label htmlFor="reauth-password-input" className="text-xs font-bold text-[#111111] dark:text-white block">
 Password
 </label>
 <input
 id="reauth-password-input"
 type="password"
 value={reauthPassword}
 onChange={(e) => setReauthPassword(e.target.value)}
 placeholder="Enter your current password"
 disabled={deleting}
 className="w-full bg-[#FFFFFF] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-[#111111] dark:text-white font-semibold text-xs focus:outline-none focus:border-[#FBBF24]"
 />
 </div>

 {deleteError && (
 <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-semibold">
 {deleteError}
 </div>
 )}

 <div className="flex items-center gap-2.5 pt-2">
 <button
 type="button"
 onClick={handleCancelModal}
 disabled={deleting}
 className="flex-1 py-3 px-4 bg-[#FFFFFF] dark:bg-[#111111] hover:bg-neutral-100 dark:bg-[#18181B] dark:hover:bg-[#18181B] text-[#111111] dark:text-white border border-zinc-200 dark:border-zinc-800 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase"
 >
 CANCEL
 </button>

 <button
 type="button"
 onClick={() => handleExecuteDelete(reauthPassword)}
 disabled={!reauthPassword || deleting}
 className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:bg-[#E5E5E5] dark:disabled:bg-[#18181B] disabled:text-[#27272A] text-white font-black text-xs rounded-xl transition-all cursor-pointer uppercase flex items-center justify-center gap-2 "
 >
 {deleting ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
 </>
 ) : (
 <span>CONTINUE</span>
 )}
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 );
};
