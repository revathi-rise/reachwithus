import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  const { login, register, isLoading } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('vikram.sharma@example.com');
  const [password, setPassword] = useState<string>('User@123');
  const [name, setName] = useState<string>('Vikram Sharma');
  const [phone, setPhone] = useState<string>('+91 98765 43210');
  const [error, setError] = useState<string | null>(null);

  const [showApprovalInstructions, setShowApprovalInstructions] = useState<boolean>(false);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    return value.trim();
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (isRegister) {
      if (!phone.trim()) {
        setError('Please enter a valid phone number');
        return;
      }
      try {
        await register(name, email, formatPhoneNumber(phone), password);
        setShowApprovalInstructions(true);
      } catch (err: any) {
        setError(err.message || 'Registration failed');
      }
    } else {
      // Direct login
      try {
        await login(email, password);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Authentication failed');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-[#0d1322] border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              {isRegister ? 'Join ReachWithUs' : 'Sign in to ReachWithUs'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRegister ? 'Post requirements and unlock verified supplier leads' : 'Access your requirements and unlocked phone numbers'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        {showApprovalInstructions ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center mb-3 border border-indigo-500/20">
                  <ShieldCheck className="w-8 h-8 text-indigo-400" />
                </div>
                <h4 className="text-white font-bold mb-1">Verify Your Mobile Number</h4>
                <p className="text-xs text-slate-400">
                  Send a message from your registered mobile
                </p>
              </div>

              <p className="text-center text-sm leading-6 text-slate-300">Send <strong className="text-white">VERIFY</strong> by SMS from <span className="text-indigo-300 font-mono">{phone}</span> to:</p>
              <a href="sms:9344603401?body=VERIFY" className="block rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-4 text-center text-xl font-bold tracking-wider text-indigo-300">9344603401</a>
              <p className="text-center text-xs leading-5 text-slate-400">An administrator will review your message and approve your account. You will be able to post only after approval.</p>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Change phone number
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleInitialSubmit} className="space-y-3">
              {isRegister && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Mehta"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#af0891] to-[#e250e9] hover:from-[#e250e9] hover:to-[#af0891] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
          >
            <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
            </form>
          )}

        {/* Switch Login / Register */}
        <div className="pt-2 text-center text-xs text-slate-400">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-indigo-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-indigo-400 font-semibold hover:underline"
              >
                Register Free
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
