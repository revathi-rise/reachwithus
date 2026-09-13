import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: 'terms' | 'privacy') => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070b13] text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div>
            <img src="/logo.png" alt="ReachWithUs" className="h-9 w-auto max-w-[180px] object-contain" />
            <p className="text-[11px] text-slate-500">
              India&apos;s Direct Requirement Sourcing Platform
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Razorpay Secure</span>
          </span>
          <button type="button" onClick={() => onNavigate('terms')} className="text-slate-400 hover:text-white transition-colors">
            Terms &amp; Conditions
          </button>
          <button type="button" onClick={() => onNavigate('privacy')} className="text-slate-400 hover:text-white transition-colors">
            Privacy Policy
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          &copy; {new Date().getFullYear()} ReachWithUs Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
