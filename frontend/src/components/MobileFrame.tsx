import React, { useState } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const [isMobileMode, setIsMobileMode] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-[#060911] flex flex-col items-center justify-center p-0 sm:p-4 text-slate-100 relative">
      {/* Top Floating Viewport Switcher for Pair-Programming & Demos */}
      <header className="hidden sm:flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-400 z-50 shadow-lg">
        <span className="text-[11px] font-medium text-slate-400">Device Preview:</span>
        <button
          onClick={() => setIsMobileMode(true)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
            isMobileMode
              ? 'bg-[#af0891] text-white shadow-sm'
              : 'hover:text-white hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Device (390px)</span>
        </button>
        <button
          onClick={() => setIsMobileMode(false)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
            !isMobileMode
              ? 'bg-[#af0891] text-white shadow-sm'
              : 'hover:text-white hover:bg-slate-800'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Width</span>
        </button>
      </header>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col bg-[#0b101b] ${
          isMobileMode
            ? 'max-w-[420px] h-[100dvh] sm:h-[844px] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden'
            : 'max-w-4xl min-h-screen sm:min-h-[844px] sm:rounded-3xl sm:border sm:border-slate-800'
        }`}
      >
        {/* Smartphone Dynamic Notch & Status Bar (Visible in Mobile Mode) */}
        {isMobileMode && (
          <div className="w-full h-11 bg-[#0b101b] flex items-center justify-between px-7 shrink-0 select-none z-40 border-b border-white/[0.04]">
            <span className="text-[12px] font-semibold text-slate-200 tracking-tight">9:41</span>
            {/* Dynamic Island Pill */}
            <div className="w-24 h-4 bg-black rounded-full border border-slate-800/80 shadow-inner flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 text-slate-200" />
            </div>
          </div>
        )}

        {/* Content Shell */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
}
