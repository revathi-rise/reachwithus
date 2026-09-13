'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  IndianRupee,
  Calendar,
  Eye,
  Filter,
} from 'lucide-react';
import { apiRequest, Post } from '@/lib/api';

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [viewPost, setViewPost] = useState<Post | null>(null);

  // Reject Modal state
  const [rejectModalPost, setRejectModalPost] = useState<Post | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Requirement does not meet platform posting guidelines or contact validation.');

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

  const fetchModerationPosts = async () => {
    try {
      setLoading(true);
      if (activeTab === 'PENDING') {
        const data = await apiRequest<any>('/admin/moderation/queue');
        setPosts(Array.isArray(data) ? data : (data.items || []));
      } else {
        const query = activeTab === 'ALL' ? '' : `?status=${activeTab}`;
        const data = await apiRequest<{ items: Post[]; total: number }>(`/posts${query}`);
        setPosts(data.items || []);
      }
    } catch (err: any) {
      console.error('Error fetching moderation posts', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationPosts();
  }, [activeTab]);

  const handleApprove = async (postId: string) => {
    try {
      setActionLoading(postId);
      await apiRequest(`/admin/moderation/${postId}/approve`, { method: 'PATCH' });
      setFeedback('Post approved successfully! It is now visible on discovery feeds.');
      setTimeout(() => setFeedback(null), 4000);
      fetchModerationPosts();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  const submitReject = async () => {
    if (!rejectModalPost) return;
    try {
      setActionLoading(rejectModalPost.id);
      await apiRequest(`/admin/moderation/${rejectModalPost.id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: rejectReason }),
      });
      setFeedback('Post rejected. The author will be notified with your recorded reason.');
      setTimeout(() => setFeedback(null), 4000);
      setRejectModalPost(null);
      fetchModerationPosts();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.author?.name?.toLowerCase().includes(q) ||
      p.contactPhone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <span>Requirement Moderation & Quality Control</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review user-submitted requirements, verify legitimate intent, protect lead quality, and approve for public discovery.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search requirement, location, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'PENDING'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Queue</span>
        </button>
        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'APPROVED'
              ? 'bg-[#af0891] text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Approved Live Posts</span>
        </button>
        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'REJECTED'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <X className="w-3.5 h-3.5" />
          <span>Rejected</span>
        </button>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'ALL'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>All Requirements</span>
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Posts Listing */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-3 font-medium">Loading moderation items...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center">
          <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No Requirements Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'PENDING'
              ? 'Great job! The pending moderation queue is completely empty.'
              : 'No requirement records match the selected tab and search criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row gap-6 items-start justify-between"
            >
              {/* Left Column: Image gallery + Details */}
              <div className="flex flex-col sm:flex-row gap-5 flex-1">
                {/* Images */}
                <div className="shrink-0">
                  {post.images && post.images.length > 0 ? (
                    <div className="relative group">
                      <img
                        src={post.images[0].url}
                        alt={post.title}
                        className="w-36 h-36 rounded-2xl object-cover border border-slate-700 shadow-md"
                      />
                      {post.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white">
                          +{post.images.length - 1} photos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-36 h-36 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center text-slate-500 text-xs">
                      <span>No images</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-xs font-bold text-white"
                      style={{ backgroundColor: post.category?.color || '#6366f1' }}
                    >
                      {post.category?.name || 'General'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                        post.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : post.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {post.status}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{post.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{post.description}</p>

                  {/* Rejection Reason display if rejected */}
                  {post.status === 'REJECTED' && post.rejectionReason && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2 mt-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Moderation Rejection Reason:</strong>
                        <span>{post.rejectionReason}</span>
                      </div>
                    </div>
                  )}

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {post.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                      <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                      {post.budget || 'Flexible Budget'}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      {post.author?.name} ({post.author?.email})
                    </span>
                    <span className="flex items-center gap-1.5 text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      {post.contactPhone || 'Protected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex lg:flex-col gap-2 w-full lg:w-44 shrink-0 justify-end pt-2 lg:pt-0">
                <button
                  onClick={() => handleViewPost(post)}
                  className="flex-1 lg:flex-none py-2.5 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-indigo-500/30"
                >
                  <Eye className="w-4 h-4" />
                  <span>View post</span>
                </button>
                {post.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(post.id)}
                      disabled={actionLoading === post.id}
                      className="flex-1 lg:flex-none py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Requirement</span>
                    </button>
                    <button
                      onClick={() => setRejectModalPost(post)}
                      disabled={actionLoading === post.id}
                      className="flex-1 lg:flex-none py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Requirement</span>
                    </button>
                  </>
                )}

                {post.status === 'APPROVED' && (
                  <button
                    onClick={() => setRejectModalPost(post)}
                    className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors"
                  >
                    <span>Revoke / Reject</span>
                  </button>
                )}

                {post.status === 'REJECTED' && (
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors"
                  >
                    <span>Reconsider & Approve</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
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
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-relaxed text-slate-200 whitespace-pre-line">{viewPost.description}</div>
          </div>
        </div>
      )}
      {rejectModalPost && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-slate-700 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Reject Requirement Post</span>
              </h3>
              <button
                onClick={() => setRejectModalPost(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Please specify the rejection rationale. This message will be sent to the user via notification so they can correct their requirement:
            </p>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <p className="text-xs font-semibold text-white truncate">{rejectModalPost.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Author: {rejectModalPost.author?.name}</p>
            </div>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please provide valid budget details or remove duplicate posting."
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalPost(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/25 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
