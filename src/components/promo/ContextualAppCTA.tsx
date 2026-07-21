import React from "react";
import { Smartphone, ArrowUpRight } from "lucide-react";
import { openNativeApp } from "@/config/app-promo";

interface ContextualAppCTAProps {
  message?: string;
  salonId?: string;
  deepLinkPath?: string;
  className?: string;
}

export function ContextualAppCTA({
  message = "Track your turn live in the app",
  deepLinkPath = "",
  className = "",
}: ContextualAppCTAProps) {
  return (
    <div
      onClick={() => openNativeApp(deepLinkPath)}
      className={`group cursor-pointer rounded-2xl bg-gradient-to-r from-[#FAF7F2] to-[#F5EDE4] border border-[#EFE7DC] p-3.5 flex items-center justify-between shadow-xs transition hover:border-[#7A4B29]/30 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#7A4B29] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-black text-ink truncate">{message}</div>
          <div className="text-[10px] text-ink-muted truncate">
            Get instant turn notifications & live position
          </div>
        </div>
      </div>

      <button
        type="button"
        className="shrink-0 flex items-center gap-1 bg-[#7A4B29] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl group-hover:bg-[#60391F] transition shadow-xs"
      >
        <span>OPEN SNEPR</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
