import React, { useState } from "react";
import { X, MapPin, Navigation, Search, Check, Compass } from "lucide-react";
import { LocationState, PRESET_LOCALITIES } from "@/types/location";

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationState;
  onUseGps: () => void;
  onSelectManual: (localityName: string, lat: number, lng: number) => void;
  isLocating?: boolean;
}

export function LocationSelectorModal({
  isOpen,
  onClose,
  currentLocation,
  onUseGps,
  onSelectManual,
  isLocating = false,
}: LocationSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredPresets = PRESET_LOCALITIES.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-[#FAF8F5] rounded-3xl border border-[#EFE7DC] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#EFE7DC]">
          <div>
            <h2 className="text-lg font-black text-[#1C1613]">Select your location</h2>
            <p className="text-xs text-[#9C9086] mt-0.5">
              We use your location to show live salons and accurate distances near you.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#9C9086] hover:text-[#1C1613] transition rounded-full hover:bg-black/5"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Primary GPS Button */}
          <button
            type="button"
            onClick={() => {
              onUseGps();
              onClose();
            }}
            disabled={isLocating}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#7A4B29] text-white font-extrabold shadow-md hover:bg-[#60391F] transition active:scale-[0.99] disabled:opacity-70"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <Navigation className="w-5 h-5 fill-white text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-black">
                  {isLocating ? "Detecting location..." : "USE MY CURRENT LOCATION"}
                </div>
                <div className="text-[10px] text-white/70 font-medium">
                  Using device GPS for precise accuracy
                </div>
              </div>
            </div>
            {isLocating && <Compass className="w-5 h-5 animate-spin" />}
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C9086]" />
            <input
              type="text"
              placeholder="Search area, locality or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white rounded-xl border border-[#EFE7DC] text-xs text-[#1C1613] placeholder-[#9C9086] focus:outline-none focus:ring-2 focus:ring-[#7A4B29]"
            />
          </div>

          {/* Preset Localities List */}
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9C9086] mb-2">
              Popular Localities in Bhubaneswar
            </div>

            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {filteredPresets.map((preset) => {
                const isSelected = currentLocation.formattedLabel === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      onSelectManual(preset.name, preset.lat, preset.lng);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition border ${
                      isSelected
                        ? "bg-[#F5EDE4] border-[#7A4B29] text-[#7A4B29]"
                        : "bg-white border-[#EFE7DC] hover:border-[#7A4B29]/30 text-[#1C1613]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#7A4B29]" : "text-[#9C9086]"}`} />
                      <span className="text-xs font-bold truncate">{preset.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#7A4B29] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
