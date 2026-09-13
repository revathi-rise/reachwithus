'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  CreditCard,
  IndianRupee,
  Clock,
  CheckCircle2,
  Tags,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Check,
  X,
  Eye,
} from 'lucide-react';
import { apiRequest, AdminStats, Post } from '@/lib/api';

export default function OverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [viewPost, setViewPost] = useState<Post | null>(null);

  const getPublicPostUrl = (post: Post) => {
    const slug = post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
    return `${process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'}/post/${slug || post.id}`;
  };

  const handleViewPost = (post: Post) => {
    if (post.status === 'APPROVED') {
      window.open(getPublicPostUrl(post), '_blank', 'noopener,noreferrer');
    } else {
      setViewPost(post);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<AdminStats>('/admin/dashboard/stats');
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickApprove = async (postId: string) => {
    try {
      setActionLoading(postId);
      await apiRequest(`/admin/moderation/${postId}/approve`, { method: 'PATCH' });
      setActionFeedback(`Requirement approved successfully!`);
      setTimeout(() => setActionFeedback(null), 4000);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickReject = async (postId: string) => {
    const reason = prompt('Please specify a rejection reason for the requirement author:', 'Incomplete requirements or non-compliant contact details');
    if (!reason) return;

    try {
      setActionLoading(postId);
      await apiRequest(`/admin/moderation/${postId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      setActionFeedback(`Requirement rejected with reason recorded.`);
      setTimeout(() => setActionFeedback(null), 4000);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 mt-4 font-medium">Aggregating platform intelligence...</p>
      </div>
    );
  }

  const metrics = stats?.metrics;
  const totalPostsCount = (metrics?.approvedPosts || 0) + (metrics?.pendingPosts || 0) + (metrics?.rejectedPosts || 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Feedback Toast */}
      {actionFeedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center justify-between shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-medium">{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Moderation Alert Banner */}
      {metrics && metrics.pendingPosts > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-transparent border border-amber-500/30 flex items-center justify-between flex-wrap gap-4 shadow-xl shadow-amber-500/5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{metrics.pendingPosts} Requirement{metrics.pendingPosts > 1 ? 's' : ''} Awaiting Moderation</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-amber-500/30 text-amber-200">
                  Action Required
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                New user requirements must be reviewed before appearing on the public discovery feed.
              </p>
            </div>
          </div>
          <a
            href="/moderation"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 hover:shadow-amber-500/30"
          >
            <span>Review Moderation Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Users */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{metrics?.totalUsers ?? 0}</div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>100% Verified profiles</span>
            </p>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Subscribers</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{metrics?.activeSubscriptions ?? 0}</div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              ₹10/mo unlocked access
            </p>
          </div>
        </div>

        {/* Total Platform Revenue */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">₹{metrics?.totalRevenueINR ?? 0}</div>
            <p className="text-[11px] text-amber-400/90 mt-1 font-medium">
              Razorpay collections
            </p>
          </div>
        </div>

        {/* Pending Posts */}
        <div className={`glass-card p-5 rounded-2xl flex flex-col justify-between border ${
          (metrics?.pendingPosts || 0) > 0 ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">{metrics?.pendingPosts ?? 0}</div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Moderation queue
            </p>
          </div>
        </div>

        {/* Approved Live Posts */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Live Posts</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{metrics?.approvedPosts ?? 0}</div>
            <p className="text-[11px] text-indigo-300 mt-1 font-medium">
              Discoverable in feed
            </p>
          </div>
        </div>

        {/* Total Categories */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Categories</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Tags className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{metrics?.totalCategories ?? 0}</div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Active domain verticals
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Pending Requirements Review & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Pending Posts (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Pending Moderation Queue
              </h2>
              <p className="text-xs text-slate-400">
                Directly approve or reject requirement postings submitted by platform users.
              </p>
            </div>
            <a
              href="/moderation"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>View All ({metrics?.pendingPosts || 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {stats?.recentPending && stats.recentPending.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPending.map((post) => (
                <div
                  key={post.id}
                  className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {post.images && post.images.length > 0 ? (
                      <img
                        src={post.images[0].url}
                        alt={post.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 text-xs shrink-0">
                        No image
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                          style={{ backgroundColor: post.category?.color || '#6366f1' }}
                        >
                          {post.category?.name || 'General'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {post.location} &bull; Budget: <strong className="text-slate-200">{post.budget || 'Flexible'}</strong>
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {post.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span>Submitted by: <strong className="text-slate-300">{post.author?.name}</strong></span>
                        <span>&bull;</span>
                        <span className="text-indigo-400 font-mono">{post.contactPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => handleViewPost(post)}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-indigo-500/30"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View post</span>
                    </button>
                    <button
                      onClick={() => handleQuickApprove(post.id)}
                      disabled={actionLoading === post.id}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleQuickReject(post.id)}
                      disabled={actionLoading === post.id}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-600/80 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-10 rounded-2xl border border-slate-800 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">All Caught Up!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                There are no requirements currently waiting in the moderation queue.
              </p>
            </div>
          )}
        </div>

        {/* Category Breakdown (1 Col) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Category Distribution</h2>
            <p className="text-xs text-slate-400">
              Live requirement counts by market category.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            {stats?.categoriesBreakdown && stats.categoriesBreakdown.length > 0 ? (
              stats.categoriesBreakdown.map((cat, idx) => {
                const total = metrics?.approvedPosts || 1;
                const percentage = Math.min(100, Math.round((cat.postCount / (total || 1)) * 100));
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                      <span className="text-slate-400 font-semibold font-mono">
                        {cat.postCount} post{cat.postCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(percentage, cat.postCount > 0 ? 12 : 2)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500">No categories found</p>
            )}

            <div className="pt-3 border-t border-slate-800">
              <a
                href="/categories"
                className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Manage All Categories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {viewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Admin preview</p>
                <h3 className="text-base font-bold text-white">{viewPost.title}</h3>
              </div>
              <button onClick={() => setViewPost(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            {viewPost.images?.[0] && <img src={viewPost.images[0].url} alt={viewPost.title} className="mb-4 h-56 w-full rounded-xl object-cover" />}
            <div className="grid gap-3 text-xs text-slate-300 sm:grid-cols-2">
              <p><strong className="text-slate-500">Status:</strong> {viewPost.status}</p>
              <p><strong className="text-slate-500">Category:</strong> {viewPost.category?.name || 'General'}</p>
              <p><strong className="text-slate-500">Author:</strong> {viewPost.author?.name} ({viewPost.author?.email})</p>
              <p><strong className="text-slate-500">Location:</strong> {viewPost.location}</p>
              <p><strong className="text-slate-500">Budget:</strong> {viewPost.budget || 'Flexible'}</p>
              <p><strong className="text-slate-500">Contact:</strong> {viewPost.contactPhone || 'Protected'}</p>
            </div>
            <div className="mt-4 whitespace-pre-line rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-relaxed text-slate-200">{viewPost.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}
