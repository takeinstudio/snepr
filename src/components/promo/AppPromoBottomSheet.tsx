import React, { useState, useEffect } from "react";
import { X, Sparkles, Clock, ShieldCheck, ArrowUpRight } from "lucide-react";
import { SneprWordmark } from "@/components/SneprWordmark";
import {
  checkIsPromoDismissed,
  dismissPromo,
  openNativeApp,
} from "@/config/app-promo";

interface AppPromoBottomSheetProps {
  deepLinkPath?: string;
}

export function AppPromoBottomSheet({ deepLinkPath = "" }: AppPromoBottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile viewport
    const checkMobile = () => {
      const mobileWidth = window.innerWidth < 768;
      const mobileUserAgent = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
      return mobileWidth || mobileUserAgent;
    };

    if (checkMobile()) {
      setIsMobile(true);
      if (!checkIsPromoDismissed()) {
        // Delay 1.2s for smooth entrance after initial page paint
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Lock body scroll when bottom sheet is active
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  const handleDismiss = () => {
    dismissPromo();
    setIsVisible(false);
  };

  const handleGetApp = () => {
    openNativeApp(deepLinkPath);
    handleDismiss();
  };

  if (!isMobile || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex flex-col justify-end">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Slide Up Sheet */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-[#FAF8F5] rounded-t-3xl border-t border-[#EFE7DC] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header Bar with Close Button */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#7A4B29] bg-[#F5EDE4] px-2.5 py-1 rounded-full border border-[#EFE7DC]">
              Get the Snepr app
            </span>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 text-ink-muted hover:text-ink transition rounded-full hover:bg-black/5"
            aria-label="Close promotion modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Phone Preview Section */}
        <div className="relative px-5 pt-3 pb-4 flex justify-center bg-gradient-to-b from-[#FAF8F5] to-[#F5EDE4] overflow-hidden">
          <div className="relative w-full max-w-[280px] h-[170px]">
            {/* Overlapping Phone Frame 1 (Live Queue) */}
            <div className="absolute left-2 top-2 w-[180px] h-[155px] bg-[#1C1613] rounded-2xl p-2.5 shadow-xl transform -rotate-6 border border-white/10 flex flex-col justify-between">
              <div className="flex justify-between items-center text-white/70 text-[9px] font-mono">
                <span>sn≡pr</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-bold">LIVE</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2 text-white">
                <div className="text-[9px] text-white/60 font-semibold uppercase">Token #14</div>
                <div className="text-sm font-bold truncate mt-0.5">The Scissors Edge</div>
                <div className="flex justify-between items-end mt-2">
                  <div className="text-[10px] text-emerald-400 font-bold">#2 in line</div>
                  <div className="text-xs font-black">~12m left</div>
                </div>
              </div>
              <div className="bg-[#7A4B29] text-white text-[9px] font-extrabold text-center py-1 rounded-lg">
                YOUR TURN IS NEXT
              </div>
            </div>

            {/* Overlapping Phone Frame 2 (Home Screen) */}
            <div className="absolute right-2 top-0 w-[190px] h-[160px] bg-[#FAF8F5] rounded-2xl p-3 shadow-2xl transform rotate-3 border border-[#EFE7DC] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <SneprWordmark height={20} color="#7A4B29" />
                <span className="text-[8px] font-extrabold bg-[#F5EDE4] text-[#7A4B29] px-1.5 py-0.5 rounded-full">
                  BHUBANESWAR
                </span>
              </div>
              <div className="space-y-1.5 my-1">
                <div className="bg-white p-2 rounded-xl border border-[#EFE7DC] flex justify-between items-center shadow-xs">
                  <div>
                    <div className="text-[10px] font-bold text-ink truncate max-w-[100px]">Urban Look Salon</div>
                    <div className="text-[8px] text-ink-muted">15 min wait • 1.2 km</div>
                  </div>
                  <div className="text-[9px] font-black text-[#7A4B29] bg-[#F5EDE4] px-1.5 py-1 rounded-lg">
                    JOIN
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[8px] text-ink-muted pt-1 border-t border-[#EFE7DC]">
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> 5 Salons Ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pt-4 pb-6 bg-[#FAF8F5]">
          <h2 className="text-2xl font-black tracking-tight text-ink text-center">
            Know before you go.
          </h2>
          <p className="mt-2 text-xs text-ink-muted text-center leading-relaxed max-w-xs mx-auto">
            See live salon wait times, join queues from anywhere, and arrive right when it's your turn.
          </p>

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-2 my-4 pt-2 border-t border-[#EFE7DC]">
            <div className="text-center">
              <div className="text-base font-black text-[#7A4B29]">0 min</div>
              <div className="text-[9px] font-semibold text-ink-muted uppercase">Waiting Room</div>
            </div>
            <div className="text-center border-x border-[#EFE7DC]">
              <div className="text-base font-black text-[#7A4B29]">Live</div>
              <div className="text-[9px] font-semibold text-ink-muted uppercase">Chair Tracking</div>
            </div>
            <div className="text-center">
              <div className="text-base font-black text-[#7A4B29]">100%</div>
              <div className="text-[9px] font-semibold text-ink-muted uppercase">Free App</div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              onClick={handleGetApp}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#7A4B29] text-white text-sm font-extrabold shadow-lg shadow-[#7A4B29]/20 hover:bg-[#60391F] transition active:scale-[0.99]"
            >
              <span>GET SNEPR</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 text-center text-xs font-bold text-ink-muted hover:text-ink transition"
            >
              Continue on web
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
