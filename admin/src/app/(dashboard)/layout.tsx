'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { apiRequest, AdminStats } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchStats = async () => {
    try {
      setIsRefreshing(true);
      const data = await apiRequest<AdminStats>('/admin/dashboard/stats');
      setPendingCount(data.metrics.pendingPosts);
    } catch (err) {
      console.error('Failed to load pending stats', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!token || user?.role !== 'ADMIN') {
        router.push('/login');
      } else {
        fetchStats();
      }
    }
  }, [user, token, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Verifying Administrator Session...</p>
        </div>
      </div>
    );
  }

  if (!token || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex">
      {/* Sidebar fixed left */}
      <Sidebar pendingCount={pendingCount} />

      {/* Main content wrapper shifted by sidebar width */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header onRefresh={fetchStats} isRefreshing={isRefreshing} />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
