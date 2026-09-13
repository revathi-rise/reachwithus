import React from 'react';
import {
  Sparkles,
  Phone,
  MessageCircle,
  ShieldCheck,
  Search,
  ArrowRight,
  TrendingUp,
  Layers,
  Plus,
} from 'lucide-react';

interface HeroSectionProps {
  onOpenPostModal: () => void;
  onOpenSubscription: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  totalPosts: number;
}

export default function HeroSection({
  onOpenPostModal,
  onOpenSubscription,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  totalPosts,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-[#0e1424] via-[#090d17] to-[#070b12]">
      {/* Glow gradient ambient blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
        {/* VIP Access Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>India&apos;s Direct Requirement & Sourcing Network</span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="text-amber-300 font-bold">₹10/mo VIP Pass</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          Post Requirements. Discover Leads.{' '}
          <span className="bg-gradient-to-r from-[#af0891] via-[#e250e9] to-amber-300 bg-clip-text text-transparent">
            Connect Directly.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Reach thousands of suppliers, agencies, and partners across industrial materials, IT services, commercial spaces, and wholesale goods. Direct WhatsApp and phone connections with zero mediator commissions.
        </p>

        {/* Search form in Hero */}
        <div className="max-w-xl mx-auto pt-2">
          <form
            onSubmit={onSearchSubmit}
            className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl focus-within:border-indigo-500 transition-all"
          >
            <div className="flex items-center gap-2 flex-1 pl-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by requirement, city, materials, services..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#af0891] hover:bg-[#e250e9] text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              Search
            </button>
          </form>
        </div>

        {/* 4 Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <Phone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Direct Phone Call Access</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>1-Click WhatsApp Chat</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Admin Moderated Posts</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>₹10/mo Spam Protection</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            onClick={onOpenPostModal}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#af0891] to-[#e250e9] hover:from-[#e250e9] hover:to-[#af0891] text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Requirement Free</span>
          </button>
          <button
            onClick={onOpenSubscription}
            className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-slate-700/80 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Unlock All Contacts for ₹10</span>
          </button>
        </div>
      </div>
    </section>
  );
}
