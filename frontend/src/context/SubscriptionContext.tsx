import React, { createContext, useContext, useEffect, useState } from 'react';
import { request } from '../api';
import { useAuth } from './AuthContext';

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'NONE';
  daysRemaining: number;
  startDate?: string;
  endDate?: string;
  amount?: number;
}

interface SubscriptionContextType {
  status: SubscriptionStatus | null;
  isLoading: boolean;
  isSubscribed: boolean;
  refreshStatus: () => Promise<void>;
  hasPendingManualPayment: boolean;
  manualPaymentDetails: ManualPaymentDetails | null;
  submitManualPayment: (transactionId: string) => Promise<void>;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export interface ManualPaymentDetails {
  amount: number;
  currency: string;
  upiId: string;
  qrCodeUrl: string;
}

interface PaymentTransaction {
  provider: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, token, refreshUser } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [hasPendingManualPayment, setHasPendingManualPayment] = useState<boolean>(false);
  const [manualPaymentDetails, setManualPaymentDetails] = useState<ManualPaymentDetails | null>(null);

  const refreshStatus = async () => {
    if (!token) {
      setStatus(null);
      return;
    }
    try {
      setIsLoading(true);
      const [data, transactions] = await Promise.all([
        request<SubscriptionStatus>('/subscriptions/my-status'),
        request<PaymentTransaction[]>('/payments/my-transactions'),
      ]);
      setStatus(data);
      setHasPendingManualPayment(transactions.some((tx) => tx.provider === 'MANUAL_UPI' && tx.status === 'PENDING'));
    } catch (e) {
      // If error, set null
      setStatus(null);
      setHasPendingManualPayment(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    request<ManualPaymentDetails>('/payments/manual-payment-details')
      .then(setManualPaymentDetails)
      .catch(() => setManualPaymentDetails(null));
  }, []);

  useEffect(() => {
    if (token) {
      refreshStatus();
    } else {
      setStatus(null);
      setHasPendingManualPayment(false);
    }
  }, [token, user?.id]);

  const submitManualPayment = async (transactionId: string) => {
    try {
      setIsLoading(true);
      await request('/payments/manual-submissions', {
        method: 'POST',
        body: JSON.stringify({ transactionId }),
      });
      await refreshStatus();
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const simulateSubscribe = async () => {
    try {
      setIsLoading(true);
      await request('/payments/simulate-sandbox', { method: 'POST' });
      await refreshStatus();
      await refreshUser();
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processRazorpayPayment = async () => {
    try {
      setIsLoading(true);

      // Try to load Razorpay SDK
      const res = await loadRazorpayScript();
      if (!res) {
        // SDK failed — fall back to sandbox
        await simulateSubscribe();
        return;
      }

      let order: { orderId: string; amount: number; currency: string };
      try {
        // 1. Create order on backend
        order = await request<{ orderId: string; amount: number; currency: string }>(
          '/subscriptions/create-order',
          { method: 'POST' }
        );
      } catch (orderErr) {
        // Real Razorpay keys not configured — use sandbox payment
        console.warn('Razorpay order creation failed, using sandbox payment:', orderErr);
        await simulateSubscribe();
        return;
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: 'rzp_test_TNl2Xzt2XUsPia',
        amount: order.amount,
        currency: order.currency,
        name: 'ReachWithUs',
        description: 'Monthly VIP Pass',
        order_id: order.orderId,
        handler: async function (response: any) {
          try {
            // 3. Verify payment on backend
            await request('/subscriptions/verify-payment', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            await refreshStatus();
            await refreshUser();
            setIsModalOpen(false);
          } catch (err) {
            console.error('Payment verification failed:', err);
            alert('Payment verification failed. Please contact support if amount was deducted.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: {
          color: '#4F46E5',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (e) {
      console.error(e);
      // Last-resort fallback to sandbox
      try {
        await simulateSubscribe();
      } catch {
        alert('Could not process payment. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isSubscribed = status?.hasActiveSubscription === true;

  return (
    <SubscriptionContext.Provider
      value={{
        status,
        isLoading,
        isSubscribed,
        refreshStatus,
        hasPendingManualPayment,
        manualPaymentDetails,
        submitManualPayment,
        isModalOpen,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
