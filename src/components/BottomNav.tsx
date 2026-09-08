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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0C0E]/95 dark:bg-[#0B0C0E]/95 light:bg-white/95 backdrop-blur-md border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-2 py-2 md:hidden transition-colors">
        <div className="flex items-center justify-around text-[10px] font-extrabold">
          <button
            onClick={() => onChangeTab('supplier')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === 'supplier' || activeTab === 'home'
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>MY LISTINGS</span>
          </button>

          <button
            onClick={() => onChangeTab('quotes')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === 'quotes'
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
            }`}
          >
            <Inbox className="h-5 w-5" />
            <span>QUOTES</span>
          </button>

          <button
            onClick={() => onChangeTab('profile')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
            }`}
          >
            <User className="h-5 w-5" />
            <span>PROFILE</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0C0E]/95 dark:bg-[#0B0C0E]/95 light:bg-white/95 backdrop-blur-md border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-2 py-2 md:hidden transition-colors">
      <div className="flex items-center justify-around text-[10px] font-extrabold">
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-amber-500 bg-amber-500/10'
              : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
          }`}
        >
          <Home className="h-5 w-5" />
          <span>HOME</span>
        </button>

        <button
          onClick={() => onChangeTab('search')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all cursor-pointer ${
            activeTab === 'search'
              ? 'text-amber-500 bg-amber-500/10'
              : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
          }`}
        >
          <Search className="h-5 w-5" />
          <span>DISCOVER</span>
        </button>

        <button
          onClick={() => onChangeTab('saved')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all cursor-pointer ${
            activeTab === 'saved'
              ? 'text-amber-500 bg-amber-500/10'
              : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
          }`}
        >
          <Bookmark className="h-5 w-5" />
          <span>SAVED</span>
        </button>

        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-amber-500 bg-amber-500/10'
              : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
          }`}
        >
          <User className="h-5 w-5" />
          <span>PROFILE</span>
        </button>
      </div>
    </nav>
  );
};
