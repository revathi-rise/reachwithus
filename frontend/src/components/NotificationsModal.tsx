import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, Heart, Sparkles, Check } from 'lucide-react';
import { Notification } from '../types';
import { request } from '../api';
import { useAuth } from '../context/AuthContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  if (!isOpen) return null;

  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await request<Notification[]>('/notifications');
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isOpen, token]);

  const markAllRead = async () => {
    try {
      await request('/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      // Ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'POST_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'POST_REJECTED':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'SUBSCRIPTION_ACTIVATED':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'LIKE':
        return <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-[#0d1322] border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Notifications</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">No New Notifications</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                You will be notified when your requirements are approved or liked.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                  n.isRead
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                    : 'bg-indigo-950/20 border-indigo-500/30 shadow-sm'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-800 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white leading-tight">{n.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
