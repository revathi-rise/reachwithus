import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sparkles,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

interface NavbarProps {
  currentTab: string;
  onChangeTab: (tab: any) => void;
  onOpenPostModal: () => void;
  onOpenAuthModal: () => void;
  onOpenNotifications: () => void;
  onOpenSubscription: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export default function Navbar({
  currentTab,
  onChangeTab,
  onOpenPostModal,
  onOpenAuthModal,
  onOpenNotifications,
  onOpenSubscription,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: NavbarProps) {
  const { user, token, logout, loginDemoUser } = useAuth();
  const { isSubscribed, status } = useSubscription();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#090e18]/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onChangeTab('feed')}
              className="flex items-center gap-2.5 text-left shrink-0 group"
            >
              <img
                src="/logo.png"
                alt="ReachWithUs"
                className="w-auto max-w-[180px] object-contain group-hover:scale-105 transition-transform"
              />
            </button>

            {/* Desktop Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onChangeTab('feed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  currentTab === 'feed'
                    ? 'bg-slate-800/80 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Discover Requirements
              </button>
              <button
                onClick={() => onChangeTab('categories')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  currentTab === 'categories'
                    ? 'bg-slate-800/80 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => onChangeTab('subscription')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  currentTab === 'subscription'
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>₹10 VIP Pass</span>
              </button>
              
            </nav>
          </div>

          {/* Center Search bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <form onSubmit={onSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search materials, projects, cities (e.g. Steel, IT, Delhi)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </form>
          </div>

          {/* Right: Actions & User */}
          <div className="flex items-center gap-3">
            {/* VIP Status Pill */}
            {isSubscribed ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>₹10 VIP Unlocked ({status?.daysRemaining ?? 30}d left)</span>
              </div>
            ) : (
              <button
                onClick={onOpenSubscription}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unlock Contacts ₹10/mo</span>
              </button>
            )}

            {/* Post Requirement Button */}
            <button
              onClick={onOpenPostModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-[#af0891] to-[#e250e9] hover:from-amber-400 hover:via-[#e250e9] hover:to-[#e250e9] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Post Requirement</span>
              <span className="sm:hidden">Post</span>
            </button>

            {/* Notifications */}
            {token && (
              <button
                onClick={onOpenNotifications}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              </button>
            )}

            {/* User Profile / Auth */}
            {token && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                >
                  <span className="hidden md:inline text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </span>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-lg object-cover border border-indigo-500/30" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-xs font-bold">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0f172a] border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in-50 duration-200">
                    <div className="p-3 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {user.role} &bull; {isSubscribed ? 'VIP Active' : 'Free Account'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onChangeTab('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2 transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>My Requirements & Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        onChangeTab('subscription');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Subscription VIP Pass</span>
                    </button>

                    <div className="border-t border-slate-800 my-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuthModal}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-2">
            <form onSubmit={onSearchSubmit} className="mb-3">
              <input
                type="text"
                placeholder="Search requirements..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </form>
            <button
              onClick={() => {
                onChangeTab('feed');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              Discover Requirements
            </button>
            <button
              onClick={() => {
                onChangeTab('categories');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              Explore Categories
            </button>
            <button
              onClick={() => {
                onChangeTab('subscription');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/10"
            >
              ₹10/mo VIP Subscription
            </button>
            {token && (
              <button
                onClick={() => {
                  onChangeTab('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800"
              >
                My Profile & Requirements
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
