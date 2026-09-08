import React, { useState } from 'react';
import { MapPin, Search, User, Shield, ShieldCheck, Scale, Sun, Moon } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NavTab } from './BottomNav';
import { UserRole } from '../types';

interface HeaderProps {
  activeTab: NavTab;
  userRole?: UserRole;
  onChangeTab: (tab: NavTab) => void;
  onOpenProjectModal: () => void;
  onOpenAuthModal: () => void;
  onOpenSignInModal?: () => void;
  onOpenSignUpModal?: () => void;
  onOpenCompareDrawer: () => void;
  comparedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  userRole,
  onChangeTab,
  onOpenProjectModal,
  onOpenAuthModal,
  onOpenSignInModal,
  onOpenSignUpModal,
  onOpenCompareDrawer,
  comparedCount,
}) => {
  const { activeProject } = useProject();
  const { currentUser } = useAuth();
  const { isDark, setTheme } = useTheme();
  const [deniedModal, setDeniedModal] = useState(false);

  const effectiveRole = currentUser?.role || userRole || 'client';
  const isSupplier = effectiveRole === 'supplier';

  const handleSignInClick = () => {
    if (onOpenSignInModal) {
      onOpenSignInModal();
    } else {
      onOpenAuthModal();
    }
  };

  const handleShieldClick = () => {
    onChangeTab('admin');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0C0E]/90 dark:bg-[#0B0C0E]/90 light:bg-white/90 backdrop-blur-md border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & Desktop Nav Links */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onChangeTab(isSupplier ? 'supplier' : 'home')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <img
              src="/constrora-logo.svg"
              alt="CONSTRORA Logo"
              className="h-9 w-9 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-['Cabinet_Grotesk'] text-xl font-black tracking-tight text-white dark:text-white light:text-slate-900">
                CONSTR<span className="text-amber-500">ORA</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-[0.18em] text-slate-400 font-bold -mt-1">
                {isSupplier ? 'SUPPLIER PORTAL' : 'FIND WHAT YOU NEED TO BUILD'}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links - SUPPLIER VS CLIENT SEPARATION */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 p-1 rounded-xl border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200">
            {isSupplier ? (
              <>
                <button
                  onClick={() => onChangeTab('supplier')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'supplier' || activeTab === 'home'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
                  }`}
                >
                  HOME & LISTINGS
                </button>
                <button
                  onClick={() => onChangeTab('quotes')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'quotes'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
                  }`}
                >
                  QUOTE REQUESTS
                </button>
                <button
                  onClick={() => onChangeTab('profile')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
                  }`}
                >
                  PROFILE
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onChangeTab('home')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
                  }`}
                >
                  HOME
                </button>
                <button
                  onClick={() => onChangeTab('search')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'search'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
                  }`}
                >
                  DISCOVER
                </button>
                <button
                  onClick={() => onChangeTab('saved')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'saved'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
                  }`}
                >
                  SAVED
                </button>
                <button
                  onClick={() => onChangeTab('profile')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
                  }`}
                >
                  PROFILE
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Active Project Location Pill for Clients */}
        {!isSupplier && (
          <button
            onClick={onOpenProjectModal}
            className="flex items-center gap-2 bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 transition-all cursor-pointer hover:border-amber-500 max-w-[180px] sm:max-w-xs truncate"
          >
            <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              {activeProject ? `${activeProject.name} · ${activeProject.location.city}` : 'Set Project Site'}
            </span>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
              Site
            </span>
          </button>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Compare Drawer Indicator for Clients */}
          {!isSupplier && comparedCount > 0 && (
            <button
              onClick={onOpenCompareDrawer}
              className="relative flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Compare</span>
              <span className="bg-amber-500 text-black text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                {comparedCount}
              </span>
            </button>
          )}

          {/* Theme Switcher Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>

          {/* Auth Button / User Profile */}
          {currentUser ? (
            <button
              onClick={() => onChangeTab('profile')}
              className="flex items-center gap-2 bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 p-1 pr-3 rounded-xl hover:border-amber-500 transition-all cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-black font-extrabold text-xs">
                {currentUser.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:inline text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 max-w-[100px] truncate">
                {currentUser.displayName}
              </span>
            </button>
          ) : (
            <button
              onClick={handleSignInClick}
              className="flex items-center gap-1.5 bg-amber-500 text-black font-extrabold px-3.5 py-1.5 rounded-xl text-xs hover:bg-amber-400 transition-all cursor-pointer shadow-md shadow-amber-500/10 uppercase tracking-wider"
            >
              <User className="h-3.5 w-3.5" />
              <span>SIGN IN</span>
            </button>
          )}

          {/* Prominent Admin Control Icon Button */}
          <button
            onClick={handleShieldClick}
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm shadow-amber-500/5 hover:border-amber-500/60"
            title="Access Constrora Admin Control Portal"
          >
            <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-black">ADMIN</span>
          </button>
        </div>
      </div>

      {/* Access Denied Modal for Non-Admin Shield Click */}
      {deniedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121418] border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">ACCESS DENIED</h3>
              <p className="text-xs text-slate-400 mt-1">
                You don't have permission to access the admin portal. Sign in with an authorized admin account.
              </p>
            </div>
            <button
              onClick={() => setDeniedModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
