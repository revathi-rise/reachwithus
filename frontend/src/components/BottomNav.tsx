import React from 'react';
import { Home, Compass, Plus, Sparkles, User } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

export type TabType = 'feed' | 'categories' | 'post' | 'subscription' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export default function BottomNav({ currentTab, onChangeTab }: BottomNavProps) {
  const { isSubscribed } = useSubscription();

  return (
    <nav className="glass-nav h-16 shrink-0 flex items-center justify-around px-2 relative z-30">
      {/* Home / Feed */}
      <button
        onClick={() => onChangeTab('feed')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          currentTab === 'feed' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-1">Feed</span>
      </button>

      {/* Categories */}
      <button
        onClick={() => onChangeTab('categories')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          currentTab === 'categories' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-1">Explore</span>
      </button>

      {/* Floating Plus button for Post Creation */}
      <div className="flex-1 flex justify-center -mt-5">
        <button
          onClick={() => onChangeTab('post')}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#af0891] to-[#e250e9] hover:from-[#e250e9] hover:to-[#af0891] text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 border-2 border-[#0b101b] transition-transform active:scale-95"
          title="Post Requirement"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* ₹10 Subscription */}
      <button
        onClick={() => onChangeTab('subscription')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
          currentTab === 'subscription' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Sparkles className="w-5 h-5" />
          {isSubscribed && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
        <span className="text-[10px] font-medium mt-1">
          {isSubscribed ? 'VIP Active' : '₹10/mo'}
        </span>
      </button>

      {/* Profile */}
      <button
        onClick={() => onChangeTab('profile')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          currentTab === 'profile' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-1">Profile</span>
      </button>
    </nav>
  );
}
