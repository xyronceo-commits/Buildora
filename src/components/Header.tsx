import React from 'react';
import { MapPin, User, Scale, Sun, Moon } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onChangeTab(isSupplier ? 'supplier' : 'home')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <img
              src="/constrora-logo.svg"
              alt="CONSTRORA Logo"
              className="h-8 w-8 rounded-lg object-contain group-hover:scale-102 transition-transform"
            />
            <span className="font-['Cabinet_Grotesk'] text-xl font-black tracking-tight text-zinc-950 dark:text-white">
              CONSTR<span className="text-[#FBBF24]">ORA</span>
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {isSupplier ? (
              <>
                <button
                  onClick={() => onChangeTab('supplier')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer uppercase tracking-wider ${
                    activeTab === 'supplier' || activeTab === 'home'
                      ? 'bg-[#FBBF24] text-zinc-950'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  My Listings
                </button>
                <button
                  onClick={() => onChangeTab('quotes')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer uppercase tracking-wider ${
                    activeTab === 'quotes'
                      ? 'bg-[#FBBF24] text-zinc-950'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Quote Requests
                </button>
                <button
                  onClick={() => onChangeTab('profile')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer uppercase tracking-wider ${
                    activeTab === 'profile'
                      ? 'bg-[#FBBF24] text-zinc-950'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Profile
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onChangeTab('home')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer uppercase tracking-wider ${
                    activeTab === 'home'
                      ? 'bg-[#FBBF24] text-zinc-950'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onChangeTab('search')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer uppercase tracking-wider ${
                    activeTab === 'search'
                      ? 'bg-[#FBBF24] text-zinc-950'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Discover
                </button>
                <button
                  onClick={() => onChangeTab('projects')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer uppercase tracking-wider ${
                    activeTab === 'projects'
                      ? 'bg-[#FBBF24] text-zinc-950'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => onChangeTab('saved')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer uppercase tracking-wider ${
                    activeTab === 'saved'
                      ? 'bg-[#FBBF24] text-zinc-950'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Saved
                </button>
                <button
                  onClick={() => onChangeTab('profile')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer uppercase tracking-wider ${
                    activeTab === 'profile'
                      ? 'bg-[#FBBF24] text-zinc-950'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Profile
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Active Project Location for Clients */}
        {!isSupplier && (
          <button
            onClick={onOpenProjectModal}
            className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:border-[#FBBF24] transition-colors cursor-pointer max-w-[200px] sm:max-w-xs truncate"
            title="Switch active project site"
            aria-label="Switch active project site"
          >
            <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              {activeProject ? `${activeProject.name} · ${activeProject.location.city}` : 'Select Site'}
            </span>
          </button>
        )}

        {/* Right Side Utility Actions */}
        <div className="flex items-center gap-2">
          {/* Compare Indicator */}
          {!isSupplier && comparedCount > 0 && (
            <button
              onClick={onOpenCompareDrawer}
              className="relative flex items-center gap-1.5 bg-[#FBBF24]/15 border border-[#FBBF24]/50 text-zinc-900 dark:text-[#FBBF24] hover:bg-[#FBBF24]/25 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer"
            >
              <Scale className="h-4 w-4 text-amber-500" />
              <span className="hidden sm:inline">Compare</span>
              <span className="bg-[#FBBF24] text-zinc-950 text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                {comparedCount}
              </span>
            </button>
          )}

          {/* Theme Switcher Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-[#FBBF24] transition-colors cursor-pointer"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4 text-[#FBBF24]" /> : <Moon className="h-4 w-4 text-zinc-950" />}
          </button>

          {/* Auth Button / User Profile */}
          {currentUser ? (
            <button
              onClick={() => onChangeTab('profile')}
              className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 pr-3 rounded-lg hover:border-[#FBBF24] transition-colors cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FBBF24] text-zinc-950 font-black text-xs">
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden lg:inline text-xs font-bold text-zinc-900 dark:text-zinc-100 max-w-[100px] truncate">
                {currentUser.displayName || 'Profile'}
              </span>
            </button>
          ) : (
            <button
              onClick={handleSignInClick}
              className="flex items-center gap-1.5 bg-[#FBBF24] hover:bg-[#F59E0B] text-zinc-950 font-black px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer uppercase tracking-wider"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
