'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { apiRequest, User } from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<any>('/admin/users');
      setUsers(Array.isArray(data) ? data : (data.items || []));
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await apiRequest(`/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
      });
      setFeedback(`User status updated successfully.`);
      setTimeout(() => setFeedback(null), 4000);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const togglePhoneVerification = async (userId: string, currentStatus: boolean) => {
    try {
      await apiRequest(`/admin/users/${userId}/toggle-phone-verification`, {
        method: 'PATCH',
      });
      setFeedback(`Phone verification ${currentStatus ? 'revoked' : 'approved'} successfully.`);
      setTimeout(() => setFeedback(null), 4000);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Phone verification update failed');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Platform User Directory & Role Governance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage registered stakeholders, audit subscriber statuses, verify identities, and govern account permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Regular Users</option>
            <option value="ADMIN">Administrators</option>
          </select>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* User Table Card */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-3 font-medium">Retrieving user records...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No Users Found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="p-4 pl-6">User / Profile</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Platform Role</th>
                  <th className="p-4">Subscription</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Phone Approval</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredUsers.map((u) => {
                  const hasActiveSub = u.subscription?.status === 'ACTIVE';
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Name & Avatar */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          {u.avatarUrl ? (
                            <button
                              type="button"
                              onClick={() => setViewingUser(u)}
                              className="h-9 w-9 cursor-zoom-in overflow-hidden rounded-full border border-slate-700"
                              title={`View ${u.name}'s image`}
                            >
                              <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
                            </button>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
                              {u.name[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4 text-slate-300 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 font-mono text-slate-400">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role === 'ADMIN' && <ShieldCheck className="w-3 h-3 text-purple-400" />}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => togglePhoneVerification(u.id, u.phoneVerified)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${u.phoneVerified ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}
                        >
                          {u.phoneVerified ? 'Verified' : 'Verify Phone'}
                        </button>
                      </td>

                      {/* Subscription */}
                      <td className="p-4">
                        {hasActiveSub ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>₹10 Active</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Free / Standard</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.isActive
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          <span>{u.isActive ? 'Active' : 'Suspended'}</span>
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => toggleUserStatus(u.id, u.isActive)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              u.isActive
                                ? 'bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                            }`}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {viewingUser?.avatarUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setViewingUser(null)}
        >
          <div className="relative max-w-lg rounded-2xl border border-slate-700 bg-[#0d1322] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setViewingUser(null)}
              className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              aria-label="Close image viewer"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={viewingUser.avatarUrl} alt={viewingUser.name} className="max-h-[75vh] max-w-[80vw] rounded-xl object-contain" />
            <p className="mt-3 text-center text-sm font-semibold text-white">{viewingUser.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
