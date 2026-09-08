import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, Theme } from '../context/ThemeContext';
import { useProject } from '../context/ProjectContext';
import { UserRole } from '../types';

interface ProfileViewProps {
  onOpenAuthModal: () => void;
  onOpenSignInModal?: () => void;
  onOpenSignUpModal?: () => void;
  onNavigateTab: (tab: any) => void;
  quoteRequests?: any[];
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationStep, setDeleteConfirmationStep] = useState<1 | 2>(1);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmInputText, setConfirmInputText] = useState('');

  const handleStartDeleteFlow = () => {
    setShowDeleteModal(true);
    setDeleteConfirmationStep(1);
    setDeleteError(null);
    setConfirmInputText('');
  };

  const handleProceedToStep2 = () => {
    setDeleteConfirmationStep(2);
    setDeleteError(null);
  };

  const handleFinalDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      if (onNavigateTab) {
        onNavigateTab('profile');
      }
      if (onOpenSignUpModal) {
        onOpenSignUpModal();
      } else if (onOpenSignInModal) {
        onOpenSignInModal();
      } else if (onOpenAuthModal) {
        onOpenAuthModal();
      }
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete account. Please try signing out and signing in again.');
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
            WELCOME TO BUILDORA
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
                  <span>Yard Address: <strong className="text-white">Plot 12, Gbongan Road Industrial Zone, Osogbo, Osun State</strong></span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-extrabold transition-all cursor-pointer uppercase tracking-wider"
            >
              <LogOut className="h-4 w-4 text-amber-400" /> Sign Out of Buildora
            </button>

            <button
              onClick={handleStartDeleteFlow}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-extrabold transition-all cursor-pointer uppercase tracking-wider"
            >
              <Trash2 className="h-4 w-4 text-rose-400" /> Delete Account
            </button>
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

            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-extrabold transition-all cursor-pointer uppercase tracking-wider"
              >
                <LogOut className="h-4 w-4 text-amber-400" /> Sign Out
              </button>

              <button
                onClick={handleStartDeleteFlow}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-extrabold transition-all cursor-pointer uppercase tracking-wider"
              >
                <Trash2 className="h-4 w-4 text-rose-400" /> Delete Account
              </button>
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
              href="mailto:support@buildora.ng"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-amber-500"
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Contact Buildora Support</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </a>

            <div className="p-4 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-400 text-[11px] space-y-1">
              <div className="font-bold text-white dark:text-white light:text-slate-900">
                BUILDORA PLATFORM V1.0
              </div>
              <div>Find what you need to build. DISCOVER · COMPARE · CONNECT.</div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal (2-Step Warning Flow) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121418] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 text-left shadow-2xl relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl shrink-0">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-white">
                  DELETE ACCOUNT
                </h3>
                <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider">
                  {deleteConfirmationStep === 1 ? 'Attempt 1 of 2: Warning Notice' : 'Attempt 2 of 2: Final Confirmation'}
                </p>
              </div>
            </div>

            {/* STEP 1: FIRST ATTEMPT WARNING */}
            {deleteConfirmationStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-slate-200 space-y-2">
                  <p className="font-extrabold text-rose-400 flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    ⚠️ WARNING: THIS ACTION CANNOT BE UNDONE!
                  </p>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Deleting your Buildora account will permanently erase:
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1 font-medium pl-1">
                    <li>Your complete user profile & business data</li>
                    <li>Saved equipment & material resource binders</li>
                    <li>Active construction site projects & quotes</li>
                    <li>Supplier fleet & rental quote history</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer uppercase"
                  >
                    Cancel & Keep Account
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-all cursor-pointer uppercase shadow-lg shadow-rose-600/30"
                  >
                    Proceed to Confirm
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SECOND ATTEMPT FINAL CONFIRMATION */}
            {deleteConfirmationStep === 2 && (
              <div className="space-y-4">
                <div className="p-4 bg-rose-950/40 border border-rose-500/50 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-rose-200">
                    Please type <span className="bg-rose-500 text-black font-black px-1.5 py-0.5 rounded tracking-widest uppercase">DELETE</span> below to confirm second attempt:
                  </p>
                  <input
                    type="text"
                    value={confirmInputText}
                    onChange={(e) => setConfirmInputText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full bg-slate-900 border border-rose-500/40 rounded-xl px-3.5 py-2.5 text-white font-black text-sm tracking-wider uppercase focus:outline-none focus:border-rose-500 placeholder:normal-case placeholder:font-normal placeholder:text-slate-500"
                  />
                </div>

                {deleteError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-semibold">
                    {deleteError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmationStep(1)}
                    disabled={deleting}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer uppercase"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalDeleteAccount}
                    disabled={confirmInputText.trim().toUpperCase() !== 'DELETE' || deleting}
                    className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer uppercase flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" /> Permanent Delete
                      </>
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
