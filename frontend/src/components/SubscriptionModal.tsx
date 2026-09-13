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
  Upload,
  Clock,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
}

export default function SubscriptionModal({ isOpen, onClose, onAuthRequired }: SubscriptionModalProps) {
  const { isSubscribed, hasPendingManualPayment, manualPaymentDetails, submitManualPayment, isLoading } = useSubscription();
  const { token } = useAuth();
  const [transactionId, setTransactionId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // If already subscribed, don't show the modal content
  if (isSubscribed) return null;


  const handleSubmitPayment = async () => {
    if (!token) {
      onClose();
      onAuthRequired();
      return;
    }
    if (!transactionId.trim()) {
      alert('Please enter your UPI transaction ID.');
      return;
    }
    try {
      await submitManualPayment(transactionId.trim());
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Could not submit your UPI transaction ID');
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
            <span><strong>Manual UPI payment</strong> with admin verification</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2 relative z-10">
          {submitted || hasPendingManualPayment ? (
            <div className="py-3 px-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Payment proof is pending admin approval.</span>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-center space-y-2">
                <img src={manualPaymentDetails?.qrCodeUrl || '/payment-qr.jpeg'} alt="UPI payment QR code" className="mx-auto h-40 w-40 rounded-lg bg-white object-contain p-1" />
                {manualPaymentDetails?.upiId && <p className="text-xs text-slate-300">UPI ID: <strong>{manualPaymentDetails.upiId}</strong></p>}
                <p className="text-[11px] text-slate-400">Pay ₹{manualPaymentDetails?.amount ?? 10}, then enter the UPI transaction ID.</p>
              </div>
              <input required value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="UPI transaction ID (required)" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
              <button
                onClick={handleSubmitPayment}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-[#af0891] to-[#e250e9] hover:from-amber-400 hover:via-[#e250e9] hover:to-[#e250e9] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{isLoading ? 'Submitting...' : 'Submit UPI transaction ID'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <span>Access activates only after an admin approves your payment.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
