'use client';

import React from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  Tags,
  Users,
  CreditCard,
  Activity,
  LogOut,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  pendingCount?: number;
}

export default function Sidebar({ pendingCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'Moderation Queue',
      href: '/moderation',
      icon: ShieldCheck,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      label: 'Categories',
      href: '/categories',
      icon: Tags,
    },
    {
      label: 'Users Directory',
      href: '/users',
      icon: Users,
    },
    {
      label: 'Subscriptions',
      href: '/subscriptions',
      icon: CreditCard,
    },
    {
      label: 'API & Diagnostics',
      href: '/diagnostics',
      icon: Activity,
    },
  ];

  return (
    <aside className="w-64 bg-[#0d1321] border-r border-slate-800 flex flex-col h-screen fixed top-0 left-0 z-40">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              ReachWithUs
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400 block">
              Admin Platform
            </span>
          </div>
        </a>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          v1.0
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 pb-2">
          Platform Governance
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#af0891] text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Subscription Pricing Pill */}
      <div className="mx-3 my-2 p-3 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-white">Subscription Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Standard plan: <span className="text-indigo-300 font-semibold">₹10 / month</span> for phone unlocks.
        </p>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-[#0a0f1a]">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@reachwithus.com'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
