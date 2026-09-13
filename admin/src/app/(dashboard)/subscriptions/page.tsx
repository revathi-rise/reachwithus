'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  IndianRupee,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  Receipt,
  User,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { apiRequest, PaymentTransaction } from '@/lib/api';

export default function SubscriptionsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<any>('/admin/transactions');
      setTransactions(Array.isArray(data) ? data : (data.items || []));
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalRevenue = transactions.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const reviewManualPayment = async (id: string, approved: boolean) => {
    try {
      await apiRequest(`/admin/transactions/${id}/${approved ? 'approve-manual' : 'reject-manual'}`, {
        method: 'PATCH',
        body: approved ? undefined : JSON.stringify({ note: 'Payment could not be verified. Please submit a new screenshot.' }),
      });
      setFeedback(approved ? 'Payment approved and subscription activated.' : 'Payment submission rejected.');
      fetchTransactions();
    } catch (err: any) {
      alert(err.message || 'Could not review payment');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <span>₹10 Subscription & Transaction Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit contact reveal subscription transactions, verify Razorpay payment signatures, and simulate sandbox billing.
          </p>
        </div>

      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">₹{totalRevenue}</div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>100% Settled via Razorpay</span>
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{transactions.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Verified ledger entries
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Standard Model</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">₹10.00 <span className="text-xs font-normal text-slate-400">/ 30 days</span></div>
          <p className="text-[11px] text-slate-400 mt-1">
            Unlimited contact details reveal
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-400" />
            <span>Recent Payment Transactions</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real-time DB synchronization</span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-3 font-medium">Fetching payment records...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No Transactions Yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Simulate ₹10 Payment&quot; above to generate a test subscription transaction.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="p-4 pl-6">Subscriber</th>
                  <th className="p-4">Payment & Order Identifiers</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment proof & status</th>
                  <th className="p-4">Review</th>
                  <th className="p-4 pr-6">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-white">{tx.user?.name || 'Subscriber'}</div>
                      <div className="text-[11px] text-slate-500">{tx.user?.email || 'N/A'}</div>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-slate-300 space-y-0.5">
                      <div>
                        <span className="text-slate-500">Order:</span> {tx.orderId}
                      </div>
                      <div>
                        <span className="text-slate-500">PayID:</span> {tx.paymentId}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-emerald-400 font-mono text-sm">
                        ₹{tx.amount}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1 uppercase">{tx.currency}</span>
                    </td>

                    <td className="p-4">
                      {tx.paymentProofUrl && (
                        <a href={tx.paymentProofUrl} target="_blank" rel="noreferrer" className="mb-2 block text-[11px] text-indigo-300 hover:underline">View screenshot</a>
                      )}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{tx.status}</span>
                      </span>
                    </td>

                    <td className="p-4">
                      {tx.provider === 'MANUAL_UPI' && tx.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button onClick={() => reviewManualPayment(tx.id, true)} className="rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[10px] font-bold text-slate-950">Approve</button>
                          <button onClick={() => reviewManualPayment(tx.id, false)} className="rounded-lg border border-rose-500/40 px-2.5 py-1.5 text-[10px] font-bold text-rose-300">Reject</button>
                        </div>
                      ) : <span className="text-[11px] text-slate-500">—</span>}
                    </td>

                    <td className="p-4 pr-6 text-slate-400 text-[11px]">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
