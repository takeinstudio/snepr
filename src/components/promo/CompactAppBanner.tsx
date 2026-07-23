import React, { useState, useEffect } from "react";
import { X, Smartphone } from "lucide-react";
import { SneprLogoMark } from "@/components/SneprLogoMark";
import {
  checkIsBannerDismissed,
  dismissBanner,
  openNativeApp,
} from "@/config/app-promo";

interface CompactAppBannerProps {
  deepLinkPath?: string;
}

export function CompactAppBanner({ deepLinkPath = "" }: CompactAppBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      return window.innerWidth < 768 || /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    };

    if (checkMobile() && !checkIsBannerDismissed()) {
      setIsMobile(true);
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissBanner();
    setIsVisible(false);
  };

  const handleOpenApp = () => {
    openNativeApp(deepLinkPath);
  };

  if (!isMobile || !isVisible) return null;

  return (
    <div className="bg-[#1C1613] text-white px-3 py-2.5 flex items-center justify-between border-b border-[#332924] shadow-xs">
      <div className="flex items-center gap-2.5 min-w-0 flex-1" onClick={handleOpenApp}>
        <div className="w-8 h-8 rounded-xl bg-[#7A4B29] flex items-center justify-center shrink-0 border border-white/10 shadow-xs">
          <SneprLogoMark height={20} color="#FAF8F5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-extrabold truncate text-[#FAF8F5] leading-tight">
            Skip the wait with Snepr
          </div>
          <div className="text-[10px] text-white/60 truncate leading-tight">
            Live queues & turn updates
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <button
          type="button"
          onClick={handleOpenApp}
          className="bg-[#7A4B29] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full hover:bg-[#60391F] transition active:scale-95 border border-white/10"
        >
          OPEN APP
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 text-white/50 hover:text-white transition rounded-full"
          aria-label="Dismiss app banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
