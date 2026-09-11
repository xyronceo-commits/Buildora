import React from 'react';
import { MapPin, Search, User, Scale, Sun, Moon } from 'lucide-react';
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

  const effectiveRole = currentUser?.role || userRole || 'client';
  const isSupplier = effectiveRole === 'supplier';

  const handleSignInClick = () => {
    if (onOpenSignInModal) {
      onOpenSignInModal();
    } else {
      onOpenAuthModal();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#374151] px-4 py-3 transition-colors">
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
              <span className="font-['Cabinet_Grotesk'] text-xl font-black tracking-tight text-[#111111] dark:text-white">
                CONSTR<span className="text-[#FBBF24]">ORA</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-[0.18em] text-[#6B7280] dark:text-[#9CA3AF] font-bold -mt-1">
                {isSupplier ? 'SUPPLIER PORTAL' : 'FIND WHAT YOU NEED TO BUILD'}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links - SUPPLIER VS CLIENT SEPARATION */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F7F7F5] dark:bg-[#1F2937] p-1 rounded-xl border border-[#E5E5E5] dark:border-[#374151]">
            {isSupplier ? (
              <>
                <button
                  onClick={() => onChangeTab('supplier')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'supplier' || activeTab === 'home'
                      ? 'bg-[#FBBF24] text-[#111111] shadow-sm'
                      : 'text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-white'
                  }`}
                >
                  HOME & LISTINGS
                </button>
                <button
                  onClick={() => onChangeTab('quotes')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'quotes'
                      ? 'bg-[#FBBF24] text-[#111111] shadow-sm'
                      : 'text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-white'
                  }`}
                >
                  QUOTE REQUESTS
                </button>
                <button
                  onClick={() => onChangeTab('profile')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-[#FBBF24] text-[#111111] shadow-sm'
                      : 'text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-white'
                  }`}
                >
                  PROFILE
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onChangeTab('home')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-[#FBBF24] text-[#111111] shadow-sm'
                      : 'text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-white'
                  }`}
                >
                  HOME
                </button>
                <button
                  onClick={() => onChangeTab('search')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'search'
                      ? 'bg-[#FBBF24] text-[#111111] shadow-sm'
                      : 'text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-white'
                  }`}
                >
                  DISCOVER
                </button>
                <button
                  onClick={() => onChangeTab('saved')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'saved'
                      ? 'bg-[#FBBF24] text-[#111111] shadow-sm'
                      : 'text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-white'
                  }`}
                >
                  SAVED
                </button>
                <button
                  onClick={() => onChangeTab('profile')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-[#FBBF24] text-[#111111] shadow-sm'
                      : 'text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-white'
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
            className="flex items-center gap-2 bg-[#F7F7F5] dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] px-3 py-1.5 rounded-xl text-xs font-bold text-[#111111] dark:text-white transition-all cursor-pointer hover:border-[#FBBF24] max-w-[180px] sm:max-w-xs truncate shadow-xs"
          >
            <MapPin className="h-3.5 w-3.5 text-[#F59E0B] shrink-0" />
            <span className="truncate">
              {activeProject ? `${activeProject.name} · ${activeProject.location.city}` : 'Set Project Site'}
            </span>
            <span className="text-[10px] text-[#111111] bg-[#FBBF24] px-1.5 py-0.5 rounded font-black uppercase shrink-0">
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
              className="relative flex items-center gap-1.5 bg-[#FBBF24]/15 border border-[#FBBF24]/50 text-[#111111] dark:text-[#FBBF24] hover:bg-[#FBBF24]/25 px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
            >
              <Scale className="h-4 w-4 text-[#F59E0B]" />
              <span className="hidden sm:inline">Compare</span>
              <span className="bg-[#FBBF24] text-[#111111] text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                {comparedCount}
              </span>
            </button>
          )}

          {/* Theme Switcher Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-[#F7F7F5] dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#FBBF24] transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-[#FBBF24]" /> : <Moon className="h-4 w-4 text-[#111111]" />}
          </button>

          {/* Auth Button / User Profile */}
          {currentUser ? (
            <button
              onClick={() => onChangeTab('profile')}
              className="flex items-center gap-2 bg-[#F7F7F5] dark:bg-[#1F2937] border border-[#E5E5E5] dark:border-[#374151] p-1 pr-3 rounded-xl hover:border-[#FBBF24] transition-all cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FBBF24] text-[#111111] font-black text-xs">
                {currentUser.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:inline text-xs font-bold text-[#111111] dark:text-white max-w-[100px] truncate">
                {currentUser.displayName}
              </span>
            </button>
          ) : (
            <button
              onClick={handleSignInClick}
              className="flex items-center gap-1.5 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm uppercase tracking-wider"
            >
              <User className="h-3.5 w-3.5" />
              <span>SIGN IN</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
