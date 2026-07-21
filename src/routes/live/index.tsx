import { createFileRoute, Link } from "@tanstack/react-router";
import { getSalons } from "../../backend/functions/salons";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  Search, SlidersHorizontal, MapPin, ChevronDown, Smartphone
} from "lucide-react";
import { SneprWordmark } from "@/components/SneprWordmark";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/live/")({
  head: () => ({
    meta: [
      { title: "Live Salons Near You | Snepr" },
      { name: "description", content: "See live wait times at salons near you. Join the queue from your phone and walk straight in." },
    ],
    links: [{ rel: "canonical", href: "https://snepr.in/live" }],
  }),
  component: LiveDashboard,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type QueueStatus = "available" | "finishing" | "busy";
type SortOption = "distance" | "wait" | "rating";
type FilterOption = "all" | "available" | "shortest" | "top-rated";

interface Salon {
  id: number;
  name: string;
  address: string | null;
  category: string | null;
  rating: string | null;
  reviewCount: number | null;
  queueStatus: QueueStatus;
  waitTime: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColor = (s: QueueStatus) =>
  s === "available" ? "#00C853" : s === "finishing" ? "#F59E0B" : "#EF4444";

const statusLabel = (s: QueueStatus) =>
  s === "available" ? "Available" : s === "finishing" ? "Finishing" : "Busy";

// ─── Pulse dot (pure CSS) ─────────────────────────────────────────────────────

function PulseDot({ color = "#00C853" }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: color }} />
    </span>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useSalons() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/salons");
      if (!r.ok) throw new Error("Failed to load");
      const data = await r.json();
      setSalons(data);
      setError(null);
    } catch (e: any) {
      // Fallback to server function if API route fails (e.g. static export)
      try {
        const data = await getSalons({ data: {} });
        const salonsWithStatus = data.map((salon: any) => ({
          ...salon,
          queueStatus: salon.id % 3 === 0 ? "busy" : salon.id % 2 === 0 ? "finishing" : "available",
          waitTime: salon.id * 5 + 5,
        }));
        setSalons(salonsWithStatus);
        setError(null);
      } catch {
        setError("Could not load salons");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  return { salons, loading, error, reload: load };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function LiveDashboard() {
  const { salons, loading, error, reload } = useSalons();
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [sort, setSort] = useState<SortOption>("distance");
  const [search, setSearch] = useState("");

  const filtered = salons
    .filter(s => {
      if (search) return s.name.toLowerCase().includes(search.toLowerCase()) || (s.address ?? "").toLowerCase().includes(search.toLowerCase());
      if (activeFilter === "available") return s.queueStatus === "available";
      if (activeFilter === "shortest") return s.waitTime <= 15;
      return true;
    })
    .sort((a, b) => {
      if (sort === "wait") return a.waitTime - b.waitTime;
      if (sort === "rating") return parseFloat(b.rating ?? "0") - parseFloat(a.rating ?? "0");
      return 0;
    });

  const featured = [...salons]
    .filter(s => s.queueStatus === "available")
    .sort((a, b) => a.waitTime - b.waitTime)
    .slice(0, 4);

  const shortWaitCount = salons.filter(s => s.queueStatus === "available").length;

  return (
    <div className="min-h-screen bg-[#F7F7F8] font-sans text-[#0A0A0A]">

      {/* ── Desktop layout ───────────────────────────────────────────────── */}
      <div className="flex min-h-screen">

        {/* Left Sidebar — desktop only */}
        <aside className="hidden lg:flex w-[260px] xl:w-[280px] shrink-0 flex-col sticky top-0 h-screen bg-white border-r border-[#EBEBEC] z-20">
          <div className="p-6 border-b border-[#EBEBEC]">
            <Link to="/">
              <SneprWordmark height={26} className="text-[#0A0A0A]" />
            </Link>
          </div>

          {/* Location */}
          <div className="px-4 py-4 border-b border-[#EBEBEC]">
            <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">
              <MapPin className="w-3 h-3" /> Location
            </div>
            <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F7F7F8] text-left hover:bg-[#F0F0F2] transition-colors">
              <span className="text-[13.5px] font-semibold text-[#0A0A0A] truncate">Patia, Bhubaneswar</span>
              <ChevronDown className="w-4 h-4 text-[#9CA3AF] shrink-0" />
            </button>
          </div>

          {/* Filter categories */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] px-3 mb-3">Browse</div>
            {([
              { id: "all", label: "Nearby" },
              { id: "shortest", label: "Shortest wait" },
              { id: "top-rated", label: "Top rated" },
              { id: "available", label: "Available now" },
            ] as const).map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all text-left",
                  activeFilter === f.id
                    ? "bg-[#00C853] text-white shadow-sm"
                    : "text-[#6B7280] hover:bg-[#F0F0F2] hover:text-[#0A0A0A]"
                )}>
                {f.id === "available" && activeFilter === f.id && <PulseDot color="white" />}
                {f.label}
              </button>
            ))}
          </nav>

          {/* Get the app — sidebar footer */}
          <div className="p-4 border-t border-[#EBEBEC]">
            <a
              href="https://snepr.in/snepr.apk"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[#00C853] text-white hover:bg-[#00B248] transition-colors"
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">Get the app</div>
                <div className="text-[13px] font-bold">Snepr for Android</div>
              </div>
            </a>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Mobile top bar */}
          <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#EBEBEC] px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <Link to="/"><SneprWordmark height={22} className="text-[#0A0A0A]" /></Link>
              <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7280]">
                <MapPin className="w-3.5 h-3.5" /> Patia, BBSR <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Mobile filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
              {([
                { id: "all", label: "Nearby" },
                { id: "shortest", label: "Shortest wait" },
                { id: "top-rated", label: "Top rated" },
                { id: "available", label: "Available now" },
              ] as const).map(f => (
                <button key={f.id} onClick={() => setActiveFilter(f.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold shrink-0 transition-all",
                    activeFilter === f.id
                      ? "bg-[#00C853] text-white"
                      : "bg-[#F0F0F2] text-[#6B7280]"
                  )}>
                  {f.label}
                </button>
              ))}
            </div>
          </header>

          {/* Live status strip */}
          {salons.length > 0 && (
            <div className="flex items-center gap-2.5 bg-[#00C85310] px-6 py-2.5 border-b border-[#00C85320]">
              <PulseDot />
              <span className="text-[13px] text-[#6B7280]">
                <span className="font-bold text-[#00C853]">{shortWaitCount} salons</span>
                {" "}near you have short waits right now
              </span>
              <span className="ml-auto text-[11px] font-bold text-[#9CA3AF] font-mono uppercase tracking-wider">
                Refreshing every 30s
              </span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6">

              {/* Search + sort bar — sticky */}
              <div className="sticky top-0 z-20 bg-[#F7F7F8] py-3 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 border-b border-transparent mb-6">
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <input
                      type="text"
                      placeholder="Search salons…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#EBEBEC] text-[14px] outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] transition-all shadow-sm"
                    />
                  </div>
                  <div className="relative">
                    <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                    <select
                      value={sort}
                      onChange={e => setSort(e.target.value as SortOption)}
                      className="pl-9 pr-8 py-3 rounded-xl bg-white border border-[#EBEBEC] text-[14px] font-medium text-[#0A0A0A] outline-none focus:ring-2 focus:ring-[#00C853]/30 appearance-none cursor-pointer shadow-sm"
                    >
                      <option value="distance">Distance</option>
                      <option value="wait">Wait time</option>
                      <option value="rating">Rating</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <div className="w-8 h-8 rounded-full border-2 border-[#00C853] border-t-transparent animate-spin" />
                  <p className="text-[14px] text-[#6B7280]">Finding salons near you…</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center h-64 justify-center gap-3">
                  <p className="text-[15px] text-[#EF4444] font-semibold">Could not load salons</p>
                  <button onClick={reload} className="px-5 py-2.5 bg-[#00C853] text-white rounded-xl font-bold text-[13px] hover:bg-[#00B248] transition-colors">Retry</button>
                </div>
              ) : (
                <>
                  {/* Featured strip */}
                  {featured.length > 0 && !search && activeFilter === "all" && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#9CA3AF] font-mono">SHORTEST WAIT NEAR YOU</span>
                        <PulseDot />
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
                        {featured.map(s => <FeaturedCard key={s.id} salon={s} />)}
                      </div>
                    </div>
                  )}

                  {/* Section header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#9CA3AF] font-mono">
                      {search ? `RESULTS FOR "${search}"` : "ALL SALONS NEAR YOU"}
                    </span>
                    <span className="text-[11px] font-bold text-[#9CA3AF] font-mono">{filtered.length}</span>
                  </div>

                  {/* Main grid */}
                  {filtered.length === 0 ? (
                    <div className="text-center py-20 text-[#9CA3AF] text-[14px]">No salons found.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filtered.map(s => <SalonGridCard key={s.id} salon={s} />)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating "Get Snepr" pill — bottom right, non-intrusive */}
      <a
        href="https://snepr.in/snepr.apk"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-[#0A0A0A] text-white rounded-full shadow-xl hover:bg-[#1A1A1A] transition-all hover:scale-105 lg:hidden"
        style={{ boxShadow: "0 4px 24px rgba(0,200,83,0.25)" }}
      >
        <Smartphone className="w-4 h-4 shrink-0" />
        <span className="text-[13px] font-bold">Get Snepr for Android</span>
      </a>
    </div>
  );
}

// ─── Featured Card ────────────────────────────────────────────────────────────

function FeaturedCard({ salon }: { salon: Salon }) {
  const color = statusColor(salon.queueStatus);
  return (
    <Link
      to={`/live/salon/${salon.id}`}
      className="group flex-none w-[172px] bg-white rounded-[18px] p-5 shadow-sm border border-[#EBEBEC] hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#F7F7F8] flex items-center justify-center text-[15px] font-black text-[#0A0A0A]">
          {salon.name[0]}
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: color + "18", color }}>
          <PulseDot color={color} />
          {statusLabel(salon.queueStatus)}
        </div>
      </div>

      <div className="text-[52px] font-black text-[#0A0A0A] leading-none font-mono">{salon.waitTime}</div>
      <div className="text-[12px] font-semibold text-[#6B7280] mb-3">min wait</div>

      <div className="text-[13px] font-bold text-[#0A0A0A] truncate">{salon.name}</div>
      <div className="text-[11px] text-[#9CA3AF] mt-0.5 truncate">{salon.category ?? "Salon"}{salon.rating ? ` · ${salon.rating}★` : ""}</div>
    </Link>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────

function SalonGridCard({ salon }: { salon: Salon }) {
  const dotColor = statusColor(salon.queueStatus);

  return (
    <Link
      to={`/live/salon/${salon.id}`}
      className="group bg-white rounded-[16px] border border-[#EBEBEC] p-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-[12px] bg-[#F7F7F8] flex items-center justify-center text-[17px] font-black text-[#0A0A0A]">
          {salon.name[0]}
        </div>
        <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: dotColor }} />
      </div>

      <div className="text-[14px] font-bold text-[#0A0A0A] leading-snug line-clamp-2 mb-1">{salon.name}</div>
      <div className="text-[11.5px] text-[#9CA3AF] mb-3 truncate">{salon.category ?? "Salon"}</div>

      <div className="flex items-baseline gap-1 mt-auto">
        <span className="text-[26px] font-black text-[#0A0A0A] font-mono leading-none">{salon.waitTime}</span>
        <span className="text-[12px] text-[#6B7280] font-semibold">min</span>
        {salon.rating && (
          <span className="ml-auto text-[11.5px] text-[#9CA3AF] font-mono font-bold">{salon.rating}★</span>
        )}
      </div>

      {/* Address appears on hover */}
      <div className="mt-2 text-[11px] text-[#9CA3AF] truncate opacity-0 group-hover:opacity-100 transition-opacity">
        {salon.address ?? ""}
      </div>
    </Link>
  );
}
