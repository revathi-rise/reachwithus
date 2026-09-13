import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Phone,
  MessageCircle,
  Zap,
  Calendar,
  CreditCard,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

interface SubscriptionScreenProps {
  onAuthRequired: () => void;
}

export default function SubscriptionScreen({ onAuthRequired }: SubscriptionScreenProps) {
  const { status, isSubscribed, hasPendingManualPayment, openModal } = useSubscription();
  const { token, user } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);

  const handleActivate = async () => {
    if (!token) {
      onAuthRequired();
      return;
    }
    openModal();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0b101b]">
      {/* Header */}
      <header className="glass-header px-5 py-4 shrink-0">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>₹10 Subscription Hub</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Access protected direct supplier phone numbers and WhatsApp chats.
        </p>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status Card */}
        {isSubscribed ? (
          /* Active Subscriber Banner */
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-indigo-950/50 border border-emerald-500/40 space-y-4 shadow-xl shadow-emerald-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">VIP Membership Active</h3>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                    Full Platform Access
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-sm">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-black/40 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Remaining</span>
                <span className="text-lg font-black text-white font-mono">
                  {status?.daysRemaining ?? 30} Days
                </span>
              </div>
              <div className="p-3 bg-black/40 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Fee Paid</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  ₹10.00
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You can now view unmasked phone numbers and launch direct WhatsApp conversations with any requirement creator.
            </p>
          </div>
        ) : (
          /* Unsubscribed Showcase */
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-amber-950/40 border border-indigo-500/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-500/30">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-widest text-indigo-300 font-bold block mb-1">
                ReachWithUs Unlimited Pass
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-white tracking-tight">₹10</span>
                <span className="text-xs text-slate-400 font-semibold">/ 30 Days</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
                Connect directly with business leads, factory managers, and contractors.
              </p>
            </div>

            {hasPendingManualPayment ? (
              <div className="py-3 px-4 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Payment proof pending admin approval.</span>
              </div>
            ) : (
              <button
                onClick={handleActivate}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-[#af0891] to-[#e250e9] hover:from-amber-400 hover:via-[#e250e9] hover:to-[#e250e9] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/40 disabled:opacity-50 active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{isLoading ? 'Processing...' : 'Activate for ₹10 / month'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Value Matrix Cards */}
        <div className="space-y-2.5 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Subscription Features
          </h4>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Direct Phone Dialing</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Instantly reveal mobile numbers of verified post authors without middleman fees.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">One-Click WhatsApp Connect</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Open WhatsApp with pre-filled requirement context and negotiate directly.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Spam-Protected Ecosystem</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                The ₹10 gate eliminates bots and cold-call scrapers, guaranteeing high-intent interactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
