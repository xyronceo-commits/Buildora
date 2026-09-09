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
      <div className="rounded-3xl bg-[#121418] dark:bg-[#121418] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-8 sm:p-12 text-center space-y-5 max-w-md mx-auto my-12 transition-colors shadow-xl">
        <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h2 className="font-['Cabinet_Grotesk'] text-2xl font-black text-white dark:text-white light:text-slate-900">
            WELCOME TO CONSTRORA
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in with email & password or create an account to list equipment, request supplier quotes, or track construction projects.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={onOpenSignInModal || onOpenAuthModal}
            className="w-full bg-amber-500 text-black font-extrabold py-3.5 px-6 rounded-xl text-xs hover:bg-amber-400 cursor-pointer uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
          >
            Sign In with Email
          </button>

          <button
            onClick={onOpenSignUpModal || onOpenAuthModal}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs cursor-pointer uppercase tracking-wider transition-all border border-slate-700"
          >
            Create New Account
          </button>
        </div>
      </div>
    );
  }

  const isSupplier = currentUser.role === 'supplier';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Top Profile Header Card */}
      <div className="rounded-3xl bg-[#121418] dark:bg-[#121418] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-6 shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-amber-500 text-black font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
              {currentUser.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Cabinet_Grotesk'] text-xl font-extrabold text-white dark:text-white light:text-slate-900">
                  {currentUser.displayName}
                </h2>
                <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 font-black px-2 py-0.5 rounded uppercase">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
              {isSupplier ? (
                <p className="text-[11px] text-slate-300 font-medium mt-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>Yard Address: <strong className="text-white">Osogbo Industrial Zone, Osun State</strong></span>
                </p>
              ) : activeProject && (
                <p className="text-[11px] text-amber-400 font-semibold mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Site: {activeProject.name} ({activeProject.location.city})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 pt-4 mt-6 overflow-x-auto text-xs font-extrabold">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'profile'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'requests'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
            }`}
          >
            QUOTE REQUESTS
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'settings'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
            }`}
          >
            SETTINGS
          </button>
          <button
            onClick={() => setActiveSubTab('help')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'help'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
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
                  className="p-4 rounded-2xl bg-[#121418] dark:bg-[#121418] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-amber-500 transition-all text-left space-y-2 cursor-pointer shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Truck className="h-4 w-4" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                  <h4 className="font-bold text-sm text-white dark:text-white light:text-slate-900">
                    My Supplier Fleet & Listings
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Manage active machinery rentals, building material inventories, and daily rental rates.
                  </p>
                </button>

                <button
                  onClick={() => onNavigateTab('quotes')}
                  className="p-4 rounded-2xl bg-[#121418] dark:bg-[#121418] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-amber-500 transition-all text-left space-y-2 cursor-pointer shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                  <h4 className="font-bold text-sm text-white dark:text-white light:text-slate-900">
                    Received Quote Requests
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Review and respond to client inquiries for heavy equipment and site deliveries.
                  </p>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigateTab('projects')}
                  className="p-4 rounded-2xl bg-[#121418] dark:bg-[#121418] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-amber-500 transition-all text-left space-y-2 cursor-pointer shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <HardHat className="h-4 w-4" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                  <h4 className="font-bold text-sm text-white dark:text-white light:text-slate-900">
                    My Construction Projects
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Set construction site addresses and discover nearby equipment & materials.
                  </p>
                </button>

                <button
                  onClick={() => onNavigateTab('saved')}
                  className="p-4 rounded-2xl bg-[#121418] dark:bg-[#121418] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-amber-500 transition-all text-left space-y-2 cursor-pointer shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Bookmark className="h-4 w-4" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                  <h4 className="font-bold text-sm text-white dark:text-white light:text-slate-900">
                    Saved Resources Binder
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Quick access to saved excavators, mixers, cement suppliers and tipper haulage.
                  </p>
                </button>
              </>
            )}
          </div>

          {/* Account Actions Section: SIGN OUT & DELETE ACCOUNT side by side */}
          <div className="p-4 rounded-2xl bg-[#121418] dark:bg-[#121418] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 space-y-3">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
              ACCOUNT ACTIONS
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={signOut}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-black transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4 text-amber-400" />
                <span>SIGN OUT</span>
              </button>

              <button
                type="button"
                onClick={handleStartDeleteFlow}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-black transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4 text-rose-400" />
                <span>DELETE ACCOUNT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUOTE REQUESTS TAB */}
      {activeSubTab === 'requests' && (
        <div className="rounded-3xl bg-[#121418] dark:bg-[#121418] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white dark:text-white light:text-slate-900">
              MY QUOTE INQUIRIES
            </h3>
            <span className="text-xs text-amber-500 font-bold">{quoteRequests.length} total</span>
          </div>

          {quoteRequests.length === 0 ? (
            <div className="p-8 text-center space-y-2 bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 rounded-2xl border border-dashed border-slate-800 dark:border-slate-800 light:border-slate-200">
              <FileText className="h-8 w-8 text-slate-500 mx-auto" />
              <h4 className="text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700">
                No Quote Requests Sent Yet
              </h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                When you request daily equipment rental quotes or bulk material pricing, your inquiry status will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quoteRequests.map((req) => (
                <div
                  key={req.quoteRequestId}
                  className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white dark:text-white light:text-slate-900">{req.itemName}</span>
                    <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px] uppercase">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Site: {req.projectName} · Quantity: {req.quantity}
                  </p>
                  <p className="text-[10px] text-slate-500">
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
        <div className="rounded-3xl bg-[#121418] dark:bg-[#121418] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-6 space-y-6">
          <h3 className="font-['Cabinet_Grotesk'] text-lg font-extrabold text-white dark:text-white light:text-slate-900 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 pb-3">
            PLATFORM SETTINGS
          </h3>

          {/* Theme Switcher */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              APPEARANCE & THEME
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'bg-amber-500 text-black border-amber-500 shadow-md'
                    : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border-slate-800 text-slate-400'
                }`}
              >
                <Sun className="h-4 w-4" />
                <span>LIGHT</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-amber-500 text-black border-amber-500 shadow-md'
                    : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border-slate-800 text-slate-400'
                }`}
              >
                <Moon className="h-4 w-4" />
                <span>DARK</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold cursor-pointer transition-all ${
                  theme === 'system'
                    ? 'bg-amber-500 text-black border-amber-500 shadow-md'
                    : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border-slate-800 text-slate-400'
                }`}
              >
                <Laptop className="h-4 w-4" />
                <span>SYSTEM</span>
              </button>
            </div>
          </div>

          {/* Account Profile Info */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              ACCOUNT INFORMATION
            </label>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 rounded-xl flex items-center justify-between border border-slate-800 dark:border-slate-800 light:border-slate-200">
                <span className="text-slate-400">Display Name:</span>
                <span className="font-bold text-white dark:text-white light:text-slate-900">
                  {currentUser.displayName}
                </span>
              </div>
              <div className="p-3 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 rounded-xl flex items-center justify-between border border-slate-800 dark:border-slate-800 light:border-slate-200">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-bold text-white dark:text-white light:text-slate-900">
                  {currentUser.email}
                </span>
              </div>
              <div className="p-3 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 rounded-xl flex items-center justify-between border border-slate-800 dark:border-slate-800 light:border-slate-200">
                <span className="text-slate-400">Account Role:</span>
                <span className="font-bold text-amber-500 uppercase">{currentUser.role}</span>
              </div>
            </div>

            <div className="pt-3">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                ACCOUNT ACTIONS
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-black transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4 text-amber-400" />
                  <span>SIGN OUT</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartDeleteFlow}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-black transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4 text-rose-400" />
                  <span>DELETE ACCOUNT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HELP & SUPPORT TAB */}
      {activeSubTab === 'help' && (
        <div className="rounded-3xl bg-[#121418] dark:bg-[#121418] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-6 space-y-4">
          <h3 className="font-['Cabinet_Grotesk'] text-lg font-extrabold text-white dark:text-white light:text-slate-900">
            HELP & SUPPORT
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Need help finding specific construction machinery, adding a supplier fleet, or verifying your business CAC documents?
          </p>

          <div className="space-y-3 pt-2 text-xs font-bold">
            <a
              href="mailto:support@constrora.ng"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-amber-500"
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Contact Constrora Support</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </a>

            <div className="p-4 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-400 text-[11px] space-y-1">
              <div className="font-bold text-white dark:text-white light:text-slate-900">
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
          <div className="bg-[#121418] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 text-left shadow-2xl relative">
            <button
              onClick={handleCancelModal}
              disabled={deleting}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* FIRST WARNING MODAL */}
            {deleteStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-white">
                      Delete your account?
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Deleting your account is permanent. Your account and associated data may be removed and you will be signed out.
                </p>

                {deleteError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold">
                    {deleteError}
                  </div>
                )}

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelModal}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase"
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
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-white">
                      Are you absolutely sure?
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300 font-medium">
                  <p className="leading-relaxed">
                    This action cannot be undone.
                  </p>
                  <p className="leading-relaxed text-slate-200 font-semibold">
                    Your CONSTRORA account will be permanently deleted. You may lose access to your profile, saved resources, quote requests, business information, listings and other account data associated with this account.
                  </p>

                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1.5 text-[11px] text-rose-200 font-medium">
                    <span className="font-black uppercase text-rose-400 block">
                      {isSupplier ? 'DATA TO BE REMOVED (SUPPLIER ACCOUNT)' : 'DATA TO BE REMOVED (CLIENT ACCOUNT)'}
                    </span>
                    {isSupplier ? (
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                        <li>Business profile & CAC verification info</li>
                        <li>Equipment & material listings</li>
                        <li>Supplier quote history & received requests</li>
                        <li>Saved data & supplier information</li>
                      </ul>
                    ) : (
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
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
                  <label htmlFor="delete-confirm-input" className="text-xs font-bold text-slate-300 block">
                    Type <strong className="text-rose-400">DELETE</strong> to confirm
                  </label>
                  <input
                    id="delete-confirm-input"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    disabled={deleting}
                    className="w-full bg-slate-900 border border-rose-500/40 rounded-xl px-3.5 py-2.5 text-white font-black text-xs uppercase tracking-widest focus:outline-none focus:border-rose-500 placeholder:normal-case placeholder:font-normal placeholder:text-slate-500"
                  />
                </div>

                {deleteError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-semibold space-y-2">
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
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 font-bold text-[11px] rounded-lg uppercase"
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
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase"
                  >
                    GO BACK
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExecuteDelete()}
                    disabled={confirmText !== 'DELETE' || deleting}
                    className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer uppercase flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
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
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl shrink-0">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-white">
                      CONFIRM YOUR PASSWORD
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  For security, please enter your password before deleting your account.
                </p>

                <div className="space-y-1.5">
                  <label htmlFor="reauth-password-input" className="text-xs font-bold text-slate-300 block">
                    Password
                  </label>
                  <input
                    id="reauth-password-input"
                    type="password"
                    value={reauthPassword}
                    onChange={(e) => setReauthPassword(e.target.value)}
                    placeholder="Enter your current password"
                    disabled={deleting}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {deleteError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-semibold">
                    {deleteError}
                  </div>
                )}

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelModal}
                    disabled={deleting}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase"
                  >
                    CANCEL
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExecuteDelete(reauthPassword)}
                    disabled={!reauthPassword || deleting}
                    className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-xs rounded-xl transition-all cursor-pointer uppercase flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
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
