'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ExternalLink, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function Header({ onRefresh, isRefreshing = false }: HeaderProps) {
  const pathname = usePathname();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'Executive Overview';
      case '/moderation':
        return 'Requirement Moderation Queue';
      case '/categories':
        return 'Category Management';
      case '/users':
        return 'Users & Access Directory';
      case '/subscriptions':
        return 'Subscriptions & Transactions';
      case '/diagnostics':
        return 'System & API Diagnostics';
      default:
        return 'Admin Dashboard';
    }
  };

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await apiRequest('/health');
        setBackendOnline(true);
      } catch (e) {
        setBackendOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0d1321]/90 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>ReachWithUs</span>
            <span>/</span>
            <span className="text-indigo-400 font-medium">{getPageTitle()}</span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">{getPageTitle()}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend status indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800">
          <div
            className={`w-2 h-2 rounded-full ${
              backendOnline === true
                ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse'
                : backendOnline === false
                ? 'bg-rose-500'
                : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-300 text-[11px]">
            {backendOnline === true
              ? 'API Live (Port 5000)'
              : backendOnline === false
              ? 'API Offline'
              : 'Checking API...'}
          </span>
        </div>

        {/* Swagger docs quick link */}
        <a
          href="http://localhost:5000/api/docs"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
        >
          <span>Swagger API Docs</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        )}
      </div>
    </header>
  );
}
