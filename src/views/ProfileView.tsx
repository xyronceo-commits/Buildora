import React, { useState, useEffect } from 'react';
import {
  User,
  Building,
  HardHat,
  LogOut,
  ArrowRight,
  FileText,
  Bookmark,
  Settings as SettingsIcon,
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, Theme } from '../context/ThemeContext';
import { useProject } from '../context/ProjectContext';
import { UserRole, QuoteRequest } from '../types';
import { NavTab } from '../components/BottomNav';

interface ProfileViewProps {
  onOpenAuthModal: () => void;
  onOpenSignInModal?: () => void;
  onOpenSignUpModal?: () => void;
  onNavigateTab: (tab: NavTab) => void;
  quoteRequests?: QuoteRequest[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenAuthModal,
  onOpenSignInModal,
  onOpenSignUpModal,
  onNavigateTab,
  quoteRequests = [],
}) => {
  const { currentUser, signOut, deleteAccount, setUserRole, updateUserProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { activeProject } = useProject();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'requests' | 'settings' | 'help'>('profile');

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

  if (!currentUser) {
    return (
      <div className="rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] p-8 sm:p-12 text-center space-y-5 max-w-md mx-auto my-12 transition-colors shadow-xs">
        <div className="h-16 w-16 bg-[#FBBF24]/20 border border-[#FBBF24]/40 text-[#111111] dark:text-[#FBBF24] rounded-2xl flex items-center justify-center mx-auto">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h2 className="font-['Cabinet_Grotesk'] text-2xl font-black text-[#111111] dark:text-white">
            WELCOME TO CONSTRORA
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">
            Sign in with email & password or create an account to list equipment, request supplier quotes, or track construction projects.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={onOpenSignInModal || onOpenAuthModal}
            className="w-full bg-[#FBBF24] text-[#111111] font-black py-3.5 px-6 rounded-xl text-xs hover:bg-[#F59E0B] cursor-pointer uppercase tracking-wider transition-all shadow-sm"
          >
            Sign In with Email
          </button>

          <button
            onClick={onOpenSignUpModal || onOpenAuthModal}
            className="w-full bg-[#111111] hover:bg-black text-white dark:bg-[#1F2937] dark:hover:bg-[#111111] font-black py-3.5 px-6 rounded-xl text-xs cursor-pointer uppercase tracking-wider transition-all border border-[#111111] dark:border-[#374151] shadow-xs"
          >
            Create New Account
          </button>

          <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#374151]">
            <button
              onClick={() => onNavigateTab('admin')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FBBF24]/15 hover:bg-[#FBBF24]/25 text-[#111111] dark:text-[#FBBF24] border border-[#FBBF24]/40 text-xs font-black transition-all cursor-pointer uppercase tracking-wider shadow-xs"
            >
              <ShieldCheck className="h-4 w-4 text-[#F59E0B]" />
              <span>ADMIN PORTAL SIGN IN</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSupplier = currentUser.role === 'supplier';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Top Profile Header Card */}
      <div className="rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#FBBF24] text-[#111111] font-black text-2xl flex items-center justify-center shadow-sm shrink-0">
              {currentUser.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Cabinet_Grotesk'] text-xl font-extrabold text-[#111111] dark:text-white">
                  {currentUser.displayName}
                </h2>
                <span className="text-[10px] bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] border border-[#FBBF24]/40 font-black px-2 py-0.5 rounded uppercase">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 font-medium">{currentUser.email}</p>
              {isSupplier ? (
                <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] font-medium mt-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#F59E0B] shrink-0" />
                  <span>Yard Address: <strong className="text-[#111111] dark:text-white">Osogbo Industrial Zone, Osun State</strong></span>
                </p>
              ) : activeProject && (
                <p className="text-[11px] text-[#111111] dark:text-[#FBBF24] font-bold mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#F59E0B]" /> Site: {activeProject.name} ({activeProject.location.city})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-t border-[#E5E5E5] dark:border-[#374151] pt-4 mt-6 overflow-x-auto text-xs font-black">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'profile'
                ? 'bg-[#FBBF24] text-[#111111] shadow-xs'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'requests'
                ? 'bg-[#FBBF24] text-[#111111] shadow-xs'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
            }`}
          >
            QUOTE REQUESTS
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'settings'
                ? 'bg-[#FBBF24] text-[#111111] shadow-xs'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
            }`}
          >
            SETTINGS
          </button>
          <button
            onClick={() => setActiveSubTab('help')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'help'
                ? 'bg-[#FBBF24] text-[#111111] shadow-xs'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
            }`}
          >
            HELP & SUPPORT
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeSubTab === 'profile' && (
        <div className="space-y-4">
          {/* Core Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {isSupplier ? (
              <>
                <button
                  onClick={() => onNavigateTab('supplier')}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] hover:border-[#FBBF24] transition-all text-left space-y-2 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] flex items-center justify-center">
                      <Truck className="h-4 w-4" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                  </div>
                  <h4 className="font-bold text-sm text-[#111111] dark:text-white">
                    My Supplier Fleet & Listings
                  </h4>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    Manage active machinery rentals, building material inventories, and daily rental rates.
                  </p>
                </button>

                <button
                  onClick={() => onNavigateTab('quotes')}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] hover:border-[#FBBF24] transition-all text-left space-y-2 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                  </div>
                  <h4 className="font-bold text-sm text-[#111111] dark:text-white">
                    Received Quote Requests
                  </h4>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    Review and respond to client inquiries for heavy equipment and site deliveries.
                  </p>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigateTab('projects')}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] hover:border-[#FBBF24] transition-all text-left space-y-2 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] flex items-center justify-center">
                      <HardHat className="h-4 w-4" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                  </div>
                  <h4 className="font-bold text-sm text-[#111111] dark:text-white">
                    My Construction Projects
                  </h4>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    Set construction site addresses and discover nearby equipment & materials.
                  </p>
                </button>

                <button
                  onClick={() => onNavigateTab('saved')}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] hover:border-[#FBBF24] transition-all text-left space-y-2 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] flex items-center justify-center">
                      <Bookmark className="h-4 w-4" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                  </div>
                  <h4 className="font-bold text-sm text-[#111111] dark:text-white">
                    Saved Resources Binder
                  </h4>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    Quick access to saved excavators, mixers, cement suppliers and tipper haulage.
                  </p>
                </button>
              </>
            )}
          </div>

          {/* Account Actions Section: SIGN OUT & DELETE ACCOUNT side by side */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] space-y-3 shadow-xs">
            <label className="text-[11px] font-black uppercase text-[#6B7280] dark:text-[#9CA3AF] tracking-wider block">
              ACCOUNT ACTIONS
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={signOut}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-[#E5E5E5] dark:border-[#374151] bg-[#F7F7F5] dark:bg-[#111111] hover:bg-slate-200 dark:hover:bg-[#1F2937] text-[#111111] dark:text-white text-xs font-black transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4 text-[#F59E0B]" />
                <span>SIGN OUT</span>
              </button>

              <button
                type="button"
                onClick={handleStartDeleteFlow}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
                <span>DELETE ACCOUNT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUOTE REQUESTS TAB */}
      {activeSubTab === 'requests' && (
        <div className="rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#111111] dark:text-white">
              MY QUOTE INQUIRIES
            </h3>
            <span className="text-xs text-[#F59E0B] font-black">{quoteRequests.length} total</span>
          </div>

          {quoteRequests.length === 0 ? (
            <div className="p-8 text-center space-y-2 bg-[#F7F7F5] dark:bg-[#111111] rounded-2xl border border-dashed border-[#E5E5E5] dark:border-[#374151]">
              <FileText className="h-8 w-8 text-[#6B7280] dark:text-[#9CA3AF] mx-auto" />
              <h4 className="text-xs font-bold text-[#111111] dark:text-white">
                No Quote Requests Sent Yet
              </h4>
              <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] max-w-xs mx-auto">
                When you request daily equipment rental quotes or bulk material pricing, your inquiry status will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quoteRequests.map((req) => (
                <div
                  key={req.quoteRequestId}
                  className="p-4 rounded-2xl bg-[#F7F7F5] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#374151] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#111111] dark:text-white font-black">{req.itemName}</span>
                    <span className="bg-[#FBBF24]/20 text-[#111111] dark:text-[#FBBF24] border border-[#FBBF24]/40 px-2 py-0.5 rounded text-[10px] uppercase font-black">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    Site: {req.projectName} · Quantity: {req.quantity}
                  </p>
                  <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-semibold">
                    Sent: {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeSubTab === 'settings' && (
        <div className="rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] p-6 space-y-6 shadow-xs">
          <h3 className="font-['Cabinet_Grotesk'] text-lg font-extrabold text-[#111111] dark:text-white border-b border-[#E5E5E5] dark:border-[#374151] pb-3">
            PLATFORM SETTINGS
          </h3>

          {/* Theme Switcher */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider block">
              APPEARANCE & THEME
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-black cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'bg-[#FBBF24] text-[#111111] border-[#FBBF24] shadow-xs'
                    : 'bg-[#F7F7F5] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF]'
                }`}
              >
                <Sun className="h-4 w-4" />
                <span>LIGHT</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-black cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-[#FBBF24] text-[#111111] border-[#FBBF24] shadow-xs'
                    : 'bg-[#F7F7F5] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF]'
                }`}
              >
                <Moon className="h-4 w-4" />
                <span>DARK</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-black cursor-pointer transition-all ${
                  theme === 'system'
                    ? 'bg-[#FBBF24] text-[#111111] border-[#FBBF24] shadow-xs'
                    : 'bg-[#F7F7F5] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF]'
                }`}
              >
                <Laptop className="h-4 w-4" />
                <span>SYSTEM</span>
              </button>
            </div>
          </div>

          {/* Account Profile Info */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider block">
              ACCOUNT INFORMATION
            </label>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#F7F7F5] dark:bg-[#111111] rounded-xl flex items-center justify-between border border-[#E5E5E5] dark:border-[#374151]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Display Name:</span>
                <span className="font-bold text-[#111111] dark:text-white">
                  {currentUser.displayName}
                </span>
              </div>
              <div className="p-3 bg-[#F7F7F5] dark:bg-[#111111] rounded-xl flex items-center justify-between border border-[#E5E5E5] dark:border-[#374151]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Email Address:</span>
                <span className="font-bold text-[#111111] dark:text-white">
                  {currentUser.email}
                </span>
              </div>
              <div className="p-3 bg-[#F7F7F5] dark:bg-[#111111] rounded-xl flex items-center justify-between border border-[#E5E5E5] dark:border-[#374151]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Account Role:</span>
                <span className="font-black text-[#111111] dark:text-[#FBBF24] uppercase">{currentUser.role}</span>
              </div>
            </div>

            <div className="pt-3">
              <label className="text-[11px] font-black uppercase text-[#6B7280] dark:text-[#9CA3AF] tracking-wider block mb-2">
                ACCOUNT ACTIONS
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-[#E5E5E5] dark:border-[#374151] bg-[#F7F7F5] dark:bg-[#111111] hover:bg-slate-200 dark:hover:bg-[#1F2937] text-[#111111] dark:text-white text-xs font-black transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4 text-[#F59E0B]" />
                  <span>SIGN OUT</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartDeleteFlow}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                  <span>DELETE ACCOUNT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HELP & SUPPORT TAB */}
      {activeSubTab === 'help' && (
        <div className="rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] p-6 space-y-4 shadow-xs">
          <h3 className="font-['Cabinet_Grotesk'] text-lg font-extrabold text-[#111111] dark:text-white">
            HELP & SUPPORT
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
            Need help finding specific construction machinery, adding a supplier fleet, or verifying your business CAC documents?
          </p>

          <div className="space-y-3 pt-2 text-xs font-bold">
            <a
              href="mailto:support@constrora.ng"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F7F5] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#374151] text-[#111111] dark:text-[#FBBF24] hover:border-[#FBBF24] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#F59E0B]" />
                <span>Contact Constrora Support</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            </a>

            <div className="p-4 bg-[#F7F7F5] dark:bg-[#111111] rounded-xl border border-[#E5E5E5] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF] text-[11px] space-y-1">
              <div className="font-black text-[#111111] dark:text-white">
                CONSTRORA PLATFORM V1.0
              </div>
              <div>Find what you need to build. DISCOVER · COMPARE · CONNECT.</div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODALS */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1F2937] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 text-left shadow-2xl relative">
            <button
              onClick={handleCancelModal}
              disabled={deleting}
              className="absolute top-5 right-5 text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* FIRST WARNING MODAL */}
            {deleteStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-[#E5E5E5] dark:border-[#374151] pb-3">
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-[#111111] dark:text-white">
                      Delete your account?
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed font-medium">
                  Deleting your account is permanent. Your account and associated data may be removed and you will be signed out.
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
                    className="flex-1 py-3 px-4 bg-[#F7F7F5] dark:bg-[#111111] hover:bg-slate-200 dark:hover:bg-[#1F2937] text-[#111111] dark:text-white border border-[#E5E5E5] dark:border-[#374151] font-bold text-xs rounded-xl transition-all cursor-pointer uppercase"
                  >
                    CANCEL
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteStep(2)}
                    className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-all cursor-pointer uppercase shadow-lg shadow-rose-600/20"
                  >
                    CONTINUE
                  </button>
                </div>
              </div>
            )}

            {/* SECOND WARNING MODAL */}
            {deleteStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-[#E5E5E5] dark:border-[#374151] pb-3">
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-[#111111] dark:text-white">
                      Are you absolutely sure?
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium">
                  <p className="leading-relaxed">
                    This action cannot be undone.
                  </p>
                  <p className="leading-relaxed text-[#111111] dark:text-white font-semibold">
                    Your CONSTRORA account will be permanently deleted. You may lose access to your profile, saved resources, quote requests, business information, listings and other account data associated with this account.
                  </p>

                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1.5 text-[11px] text-rose-700 dark:text-rose-200 font-medium">
                    <span className="font-black uppercase text-rose-600 dark:text-rose-400 block">
                      {isSupplier ? 'DATA TO BE REMOVED (SUPPLIER ACCOUNT)' : 'DATA TO BE REMOVED (CLIENT ACCOUNT)'}
                    </span>
                    {isSupplier ? (
                      <ul className="list-disc list-inside space-y-0.5 text-[#6B7280] dark:text-[#9CA3AF]">
                        <li>Business profile & CAC verification info</li>
                        <li>Equipment & material listings</li>
                        <li>Supplier quote history & received requests</li>
                        <li>Saved data & supplier information</li>
                      </ul>
                    ) : (
                      <ul className="list-disc list-inside space-y-0.5 text-[#6B7280] dark:text-[#9CA3AF]">
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
                    className="w-full bg-[#F7F7F5] dark:bg-[#111111] border border-rose-500/40 rounded-xl px-3.5 py-2.5 text-[#111111] dark:text-white font-black text-xs uppercase tracking-widest focus:outline-none focus:border-rose-500 placeholder:normal-case placeholder:font-normal placeholder:text-[#6B7280]"
                  />
                </div>

                {deleteError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-semibold space-y-2">
                    <p>{deleteError}</p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleExecuteDelete()}
                        className="px-3 py-1.5 bg-rose-600 text-white font-bold text-[11px] rounded-lg uppercase"
                      >
                        TRY AGAIN
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelModal}
                        className="px-3 py-1.5 bg-[#F7F7F5] dark:bg-[#111111] text-[#111111] dark:text-white border border-[#E5E5E5] dark:border-[#374151] font-bold text-[11px] rounded-lg uppercase"
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
                    className="flex-1 py-3 px-4 bg-[#F7F7F5] dark:bg-[#111111] hover:bg-slate-200 dark:hover:bg-[#1F2937] text-[#111111] dark:text-white border border-[#E5E5E5] dark:border-[#374151] font-bold text-xs rounded-xl transition-all cursor-pointer uppercase"
                  >
                    GO BACK
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExecuteDelete()}
                    disabled={confirmText !== 'DELETE' || deleting}
                    className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 dark:disabled:bg-[#1F2937] disabled:text-[#6B7280] dark:disabled:text-[#6B7280] disabled:border-transparent text-white font-black text-xs rounded-xl transition-all cursor-pointer uppercase flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
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
                <div className="flex items-center gap-3 border-b border-[#E5E5E5] dark:border-[#374151] pb-3">
                  <div className="p-2.5 bg-[#FBBF24]/20 border border-[#FBBF24]/40 text-[#111111] dark:text-[#FBBF24] rounded-xl shrink-0">
                    <Lock className="h-5 w-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-[#111111] dark:text-white">
                      CONFIRM YOUR PASSWORD
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed font-medium">
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
                    className="w-full bg-[#F7F7F5] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#374151] rounded-xl px-3.5 py-2.5 text-[#111111] dark:text-white font-semibold text-xs focus:outline-none focus:border-[#FBBF24]"
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
                    className="flex-1 py-3 px-4 bg-[#F7F7F5] dark:bg-[#111111] hover:bg-slate-200 dark:hover:bg-[#1F2937] text-[#111111] dark:text-white border border-[#E5E5E5] dark:border-[#374151] font-bold text-xs rounded-xl transition-all cursor-pointer uppercase"
                  >
                    CANCEL
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExecuteDelete(reauthPassword)}
                    disabled={!reauthPassword || deleting}
                    className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 dark:disabled:bg-[#1F2937] disabled:text-[#6B7280] text-white font-black text-xs rounded-xl transition-all cursor-pointer uppercase flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
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
