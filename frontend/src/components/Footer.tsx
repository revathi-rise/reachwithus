import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export default function Footer() {
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
            <span>PostgreSQL 17 &bull; NestJS API &bull; Razorpay Secure</span>
          </span>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Admin Governance Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="http://localhost:5000/api/docs"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-white flex items-center gap-1"
          >
            <span>API Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <p className="text-[11px] text-slate-500">
          &copy; {new Date().getFullYear()} ReachWithUs Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
