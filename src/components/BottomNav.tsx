import React from 'react';
import { Home, Search, Bookmark, User, Inbox, Package } from 'lucide-react';
import { UserRole } from '../types';

export type NavTab = 'home' | 'search' | 'saved' | 'projects' | 'profile' | 'supplier' | 'quotes' | 'admin' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  userRole?: UserRole;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, userRole, onChangeTab }) => {
  const isSupplier = userRole === 'supplier';

  if (isSupplier) {
    return (
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 md:hidden transition-colors"
      >
        <div className="flex items-center justify-around text-[10px] font-black">
          <button
            onClick={() => onChangeTab('supplier')}
            className={`flex flex-col items-center gap-1 min-h-[48px] justify-center px-4 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider ${
              activeTab === 'supplier' || activeTab === 'home'
                ? 'text-zinc-950 dark:text-[#FBBF24] bg-[#FBBF24]/20'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Listings</span>
          </button>

          <button
            onClick={() => onChangeTab('quotes')}
            className={`flex flex-col items-center gap-1 min-h-[48px] justify-center px-4 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider ${
              activeTab === 'quotes'
                ? 'text-zinc-950 dark:text-[#FBBF24] bg-[#FBBF24]/20'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Inbox className="h-5 w-5" />
            <span>Quotes</span>
          </button>

          <button
            onClick={() => onChangeTab('profile')}
            className={`flex flex-col items-center gap-1 min-h-[48px] justify-center px-4 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider ${
              activeTab === 'profile'
                ? 'text-zinc-950 dark:text-[#FBBF24] bg-[#FBBF24]/20'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 md:hidden transition-colors"
    >
      <div className="flex items-center justify-around text-[10px] font-black">
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center gap-1 min-h-[48px] justify-center px-4 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider ${
            activeTab === 'home'
              ? 'text-zinc-950 dark:text-[#FBBF24] bg-[#FBBF24]/20'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onChangeTab('search')}
          className={`flex flex-col items-center gap-1 min-h-[48px] justify-center px-4 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider ${
            activeTab === 'search'
              ? 'text-zinc-950 dark:text-[#FBBF24] bg-[#FBBF24]/20'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <Search className="h-5 w-5" />
          <span>Discover</span>
        </button>

        <button
          onClick={() => onChangeTab('saved')}
          className={`flex flex-col items-center gap-1 min-h-[48px] justify-center px-4 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider ${
            activeTab === 'saved'
              ? 'text-zinc-950 dark:text-[#FBBF24] bg-[#FBBF24]/20'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <Bookmark className="h-5 w-5" />
          <span>Saved</span>
        </button>

        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center gap-1 min-h-[48px] justify-center px-4 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider ${
            activeTab === 'profile'
              ? 'text-zinc-950 dark:text-[#FBBF24] bg-[#FBBF24]/20'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );
};
