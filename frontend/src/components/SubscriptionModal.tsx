import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  ArrowRight,
  CreditCard,
  Check,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
}

export default function SubscriptionModal({ isOpen, onClose, onAuthRequired }: SubscriptionModalProps) {
  const { isSubscribed, processRazorpayPayment, simulateSubscribe, isLoading } = useSubscription();
  const { token } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // If already subscribed, don't show the modal content
  if (isSubscribed) return null;


  const handleSubscribe = async () => {
    if (!token) {
      onClose();
      onAuthRequired();
      return;
    }
    try {
      await processRazorpayPayment();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Payment simulation failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-[#0d1322] border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
        {/* Glow ambient background */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">ReachWithUs VIP Pass</h3>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                Full Contact Access
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Price Tag Showcase */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-amber-950/30 border border-indigo-500/30 text-center relative z-10 shadow-lg">
          <span className="text-xs text-indigo-300 uppercase tracking-widest font-bold block mb-1">
            Unlimited Contact Reveals
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-black text-white tracking-tight">₹10</span>
            <span className="text-xs text-slate-400 font-semibold">/ 30 Days</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            Directly connect with project owners, materials suppliers, contractors, and business leads without mediator fees.
          </p>
        </div>

        {/* Benefits List */}
        <div className="space-y-2.5 relative z-10 text-xs text-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span><strong>Unlimited phone reveals</strong> across all categories</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span><strong>1-Click WhatsApp Direct Chat</strong> & Phone Dialing</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span><strong>Instant 30-Day Validity</strong> with renewal reminders</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span><strong>Protected Payments</strong> via Razorpay Gateway</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2 relative z-10">
          {success ? (
            <div className="py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>Subscription Activated Successfully!</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-[#af0891] to-[#e250e9] hover:from-amber-400 hover:via-[#e250e9] hover:to-[#e250e9] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{isLoading ? 'Processing Payment...' : 'Subscribe with Razorpay (₹10)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={async () => {
                  if (!token) { onClose(); onAuthRequired(); return; }
                  try {
                    await simulateSubscribe();
                    setSuccess(true);
                    setTimeout(() => { setSuccess(false); onClose(); }, 2000);
                  } catch (err: any) {
                    alert(err.message || 'Sandbox activation failed');
                  }
                }}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Test Sandbox Activation (Dev Only)</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <span>Razorpay for production &bull; Sandbox for testing</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
