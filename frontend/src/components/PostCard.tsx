import React, { useState } from 'react';
import {
  Heart,
  Share2,
  Lock,
  Phone,
  MessageCircle,
  MapPin,
  IndianRupee,
  Calendar,
  Sparkles,
  Check,
} from 'lucide-react';
import { Post } from '../types';
import { request } from '../api';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { getPostShareUrl } from '../lib/postLinks';

interface PostCardProps {
  post: Post;
  onSelect: (post: Post) => void;
  onAuthRequired: () => void;
}

export default function PostCard({ post, onSelect, onAuthRequired }: PostCardProps) {
  const { isSubscribed, openModal: openSubscriptionModal } = useSubscription();
  const { token, user } = useAuth();

  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState<boolean>(post.isLiked || false);
  const [sharesCount, setSharesCount] = useState<number>(post.sharesCount || 0);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [unlockedPhone, setUnlockedPhone] = useState<string | null>(
    isSubscribed && post.contactPhone ? post.contactPhone : null
  );
  const [revealing, setRevealing] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) {
      onAuthRequired();
      return;
    }
    try {
      setIsLiking(true);
      const res = await request<{ liked: boolean; likesCount: number }>(`/posts/${post.id}/like`, {
        method: 'POST',
      });
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (err) {
      console.error('Failed to like post', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await request(`/posts/${post.id}/share`, { method: 'POST' });
      setSharesCount((prev) => prev + 1);
      await navigator.clipboard.writeText(getPostShareUrl(post));
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch (err) {
      // Ignore
    }
  };

  const handleRevealContact = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="glass-card rounded-2xl p-4 border border-slate-800/80 hover:border-indigo-500/30 transition-all space-y-3 relative group">
      {/* Header: Author & Category */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {post.author?.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
              {post.author?.name ? post.author.name[0].toUpperCase() : 'U'}
            </div>
          )}
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">{post.author?.name || 'User'}</h4>
            <span className="text-[10px] text-slate-400">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm"
          style={{ backgroundColor: post.category?.color || '#4f46e5' }}
        >
          {post.category?.name || 'General'}
        </span>
      </div>

      {/* Title & Description */}
      <div
        onClick={() => onSelect(post)}
        className="cursor-pointer"
      >
        <h3 className="text-sm font-bold text-white tracking-tight line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
          {post.description}
        </p>
      </div>

      {/* Images preview if available */}
      {post.images && post.images.length > 0 && (
        <div
          onClick={() => onSelect(post)}
          className="relative rounded-xl overflow-hidden aspect-[16/9] border border-slate-800 cursor-pointer"
        >
          <img
            src={post.images[0].url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {post.images.length > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white">
              +{post.images.length - 1} photos
            </div>
          )}
        </div>
      )}

      {/* Metadata Pills: Location & Budget */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <div className="flex items-center gap-1 text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{post.location}</span>
        </div>
        {post.budget && (
          <div className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-medium">
            <IndianRupee className="w-3 h-3 text-amber-400" />
            <span>{post.budget}</span>
          </div>
        )}
      </div>

      {/* Protected Contact Section */}
      <div className="pt-1">
        {unlockedPhone ? (
          /* Unlocked State */
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">Contact Unlocked</span>
                <span className="text-xs font-mono font-bold text-white">{unlockedPhone}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <a
                href={`tel:${cleanPhone}`}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Direct Phone Call"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-colors border border-emerald-500/30"
                title="WhatsApp Direct Message"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          /* Locked State */
          <div
            onClick={handleRevealContact}
            className="p-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/20 hover:border-indigo-500/40 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Contact Number</span>
                <span className="text-xs font-mono font-semibold text-slate-300">
                  {post.maskedPhone || '+91 98•••• •••••'}
                </span>
              </div>
            </div>

            <button
              disabled={revealing}
              className="px-3 py-1.5 rounded-lg bg-[#af0891] hover:bg-[#e250e9] text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-sm shadow-indigo-600/20 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{isSubscribed ? (revealing ? 'Revealing...' : 'Reveal Contact') : 'Unlock ₹10/mo'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer: Likes, Shares, Details CTA */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1.5 transition-colors ${
              isLiked ? 'text-rose-400' : 'hover:text-rose-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-400' : ''}`} />
            <span className="font-mono text-[11px]">{likesCount}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
          >
            {copiedShare ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="font-mono text-[11px]">{sharesCount}</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelect(post)}
          className="text-[11px] text-indigo-400 font-semibold hover:text-indigo-300 hover:underline"
        >
          View details &rarr;
        </button>
      </div>
    </div>
  );
}
