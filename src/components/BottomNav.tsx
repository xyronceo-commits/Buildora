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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-t border-[#E5E5E5] dark:border-[#374151] px-2 py-2 md:hidden transition-colors">
        <div className="flex items-center justify-around text-[10px] font-black">
          <button
            onClick={() => onChangeTab('supplier')}
            className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === 'supplier' || activeTab === 'home'
                ? 'text-[#111111] dark:text-[#FBBF24] bg-[#FBBF24]/20 font-black'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>MY LISTINGS</span>
          </button>

          <button
            onClick={() => onChangeTab('quotes')}
            className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === 'quotes'
                ? 'text-[#111111] dark:text-[#FBBF24] bg-[#FBBF24]/20 font-black'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
            }`}
          >
            <Inbox className="h-5 w-5" />
            <span>QUOTES</span>
          </button>

          <button
            onClick={() => onChangeTab('profile')}
            className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'text-[#111111] dark:text-[#FBBF24] bg-[#FBBF24]/20 font-black'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-t border-[#E5E5E5] dark:border-[#374151] px-2 py-2 md:hidden transition-colors">
      <div className="flex items-center justify-around text-[10px] font-black">
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#111111] dark:text-[#FBBF24] bg-[#FBBF24]/20 font-black'
              : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
          }`}
        >
          <Home className="h-5 w-5" />
          <span>HOME</span>
        </button>

        <button
          onClick={() => onChangeTab('search')}
          className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
            activeTab === 'search'
              ? 'text-[#111111] dark:text-[#FBBF24] bg-[#FBBF24]/20 font-black'
              : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
          }`}
        >
          <Search className="h-5 w-5" />
          <span>DISCOVER</span>
        </button>

        <button
          onClick={() => onChangeTab('saved')}
          className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
            activeTab === 'saved'
              ? 'text-[#111111] dark:text-[#FBBF24] bg-[#FBBF24]/20 font-black'
              : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
          }`}
        >
          <Bookmark className="h-5 w-5" />
          <span>SAVED</span>
        </button>

        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-[#111111] dark:text-[#FBBF24] bg-[#FBBF24]/20 font-black'
              : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
          }`}
        >
          <User className="h-5 w-5" />
          <span>PROFILE</span>
        </button>
      </div>
    </nav>
  );
};
