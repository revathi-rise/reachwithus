import React, { useState } from 'react';
import {
  X,
  Lock,
  Phone,
  MessageCircle,
  MapPin,
  IndianRupee,
  Calendar,
  Sparkles,
  Heart,
  Share2,
  Check,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Post } from '../types';
import { request } from '../api';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { getPostShareUrl } from '../lib/postLinks';

interface PostDetailsModalProps {
  post: Post | null;
  onClose: () => void;
  onAuthRequired: () => void;
  fullPage?: boolean;
}

export default function PostDetailsModal({ post, onClose, onAuthRequired, fullPage = false }: PostDetailsModalProps) {
  if (!post) return null;

  const { isSubscribed, openModal: openSubscriptionModal } = useSubscription();
  const { token } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState<boolean>(post.isLiked || false);
  const [unlockedPhone, setUnlockedPhone] = useState<string | null>(
    isSubscribed && post.contactPhone ? post.contactPhone : null
  );
  const [revealing, setRevealing] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);

  const handleLike = async () => {
    if (!token) {
      onAuthRequired();
      return;
    }
    try {
      const res = await request<{ liked: boolean; likesCount: number }>(`/posts/${post.id}/like`, {
        method: 'POST',
      });
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (e) {
      // Ignore
    }
  };

  const handleShare = async () => {
    if (post.status !== 'APPROVED') return;
    try {
      await request(`/posts/${post.id}/share`, { method: 'POST' });
      await navigator.clipboard.writeText(getPostShareUrl(post));
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch (e) {
      // Ignore
    }
  };

  const handleRevealContact = async () => {
    if (!token) {
      onAuthRequired();
      return;
    }
    if (!isSubscribed) {
      openSubscriptionModal();
      return;
    }
    try {
      setRevealing(true);
      const data = await request<{ contactPhone: string }>(`/posts/${post.id}/reveal-contact`);
      setUnlockedPhone(data.contactPhone);
    } catch (err) {
      openSubscriptionModal();
    } finally {
      setRevealing(false);
    }
  };

  const cleanPhone = (unlockedPhone || post.contactPhone || '').replace(/\D/g, '');

  return (
    <div className={fullPage ? 'min-h-screen bg-[#070b13] text-slate-100' : 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4'}>
      {fullPage && (
        <div className="border-b border-indigo-500/20 bg-[#0d1322] px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">ReachWithUs Post</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Post Details</h1>
            <p className="mt-2 text-sm text-slate-400">Connect directly with the person who posted this opportunity.</p>
          </div>
        </div>
      )}
      <div className={fullPage ? 'mx-auto w-full max-w-5xl py-6 sm:py-10' : 'w-full sm:max-w-lg bg-[#0d1322] border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-300'}>
        <div className={fullPage ? 'mb-4 flex items-center justify-between px-5 sm:px-0' : 'hidden'}>
          <span className="text-sm text-slate-400">Public post</span>
          <button onClick={onClose} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">Back to posts</button>
        </div>
        <div className={fullPage ? 'overflow-hidden border border-slate-800 bg-[#0d1322] shadow-2xl sm:rounded-3xl' : 'flex min-h-0 flex-col'}>
        {/* Top bar with close button */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: post.category?.color || '#4f46e5' }}
            >
              {post.category?.name || 'Requirement'}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.viewsCount || 1} views</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className={fullPage ? 'hidden' : 'p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className={fullPage ? 'grid gap-6 p-5 sm:p-8 lg:grid-cols-2' : 'flex-1 overflow-y-auto p-5 space-y-5'}>
          {fullPage && (
            <div className="hidden space-y-4 lg:col-start-2 lg:block">
              <h2 className="text-lg font-bold leading-snug tracking-tight text-white">{post.title}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                  {post.location}
                </span>
                {post.budget && (
                  <span className="flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300">
                    <IndianRupee className="h-3.5 w-3.5 text-amber-400" />
                    {post.budget}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Post Specifications</h4>
                <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-slate-200">{post.description}</p>
              </div>
            </div>
          )}
          <div className={fullPage ? 'flex flex-col space-y-5 lg:col-start-1 lg:row-start-1 lg:row-span-3' : 'contents'}>
          {/* Photos Carousel */}
          {post.images && post.images.length > 0 && (
            <div className={fullPage ? 'space-y-2 lg:order-1' : 'space-y-2'}>
              <button
                type="button"
                onClick={() => setViewingImageUrl(post.images[activeImageIndex]?.url || post.images[0].url)}
                className="group relative block w-full cursor-zoom-in rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900 border border-slate-800"
                title="View image"
              >
                <img
                  src={post.images[activeImageIndex]?.url || post.images[0].url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-bold text-white opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">View image</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingImageUrl(post.images[activeImageIndex]?.url || post.images[0].url)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                View full image
              </button>

              {/* Thumbnails if > 1 */}
              {post.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {post.images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-indigo-500 scale-105' : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title & Metadata */}
          <div className={fullPage ? 'lg:hidden' : ''}>
            <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
              {post.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                {post.location}
              </span>
              {post.budget && (
                <span className="flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-bold">
                  <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                  {post.budget}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className={`${fullPage ? 'lg:hidden' : ''} p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Requirement Specifications
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              {post.description}
            </p>
          </div>

          {/* Author Info */}
          <div className={fullPage ? 'p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between lg:order-2' : 'p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between'}>
            <div className="flex items-center gap-3">
              {post.author?.avatarUrl ? (
                <button
                  type="button"
                  onClick={() => setViewingImageUrl(post.author!.avatarUrl!)}
                  className="h-10 w-10 cursor-zoom-in overflow-hidden rounded-full border border-slate-700"
                  title="View author image"
                >
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                  {post.author?.name ? post.author.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold text-white">{post.author?.name || 'Author'}</h4>
                <p className="text-[11px] text-slate-400">Verified Platform Member</p>
              </div>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Verified
            </span>
          </div>

          {/* Contact Reveal Card */}
          <div className={fullPage ? 'space-y-2 lg:order-3' : 'space-y-2'}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Direct Contact & Negotiation
            </h4>

            {unlockedPhone ? (
              /* Unlocked Card */
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-3 shadow-lg shadow-emerald-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Unlocked Contact Information</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    Active VIP
                  </span>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-emerald-500/20 text-center">
                  <span className="text-lg font-mono font-bold text-white tracking-wider">
                    {unlockedPhone}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Direct Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-emerald-500/30"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              /* Locked Card */
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-purple-950/30 border border-indigo-500/30 space-y-4 shadow-xl shadow-indigo-500/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-amber-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Contact Details Protected</h5>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Masked phone: <span className="font-mono text-indigo-300">{post.maskedPhone || '+91 98•••• •••••'}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30">
                    ₹10 / Month
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pl-1">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Direct phone call & WhatsApp messaging access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Unlimited contact reveals on all posts for 30 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Zero spam protection & direct vendor connect</span>
                  </div>
                </div>

                <button
                  onClick={handleRevealContact}
                  disabled={revealing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#af0891] to-[#e250e9] hover:from-[#e250e9] hover:to-[#af0891] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isSubscribed ? (revealing ? 'Revealing...' : 'Reveal Contact Number') : 'Unlock Contact for ₹10/month'}</span>
                </button>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#0a0f1c] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                isLiked ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-400' : ''}`} />
              <span>{likesCount} Likes</span>
            </button>

            {post.status === 'APPROVED' && (
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share Requirement</span>
                  </>
                )}
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
        {viewingImageUrl && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setViewingImageUrl(null)}
          >
            <button
              type="button"
              aria-label="Close image viewer"
              onClick={() => setViewingImageUrl(null)}
              className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={viewingImageUrl} alt={post.title} className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain" />
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
