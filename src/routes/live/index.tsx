import { createFileRoute, Link } from "@tanstack/react-router";
import { getSalons } from "../../backend/functions/salons";
import { useEffect, useState } from "react";
import {
  Search, MapPin, Zap, CheckCircle2, Clock, Navigation, X
} from "lucide-react";
import { SneprWordmark } from "@/components/SneprWordmark";
import { cn } from "@/lib/utils";
import { useLocation } from "../../hooks/useLocation";
import { calculateDistance, formatDistance } from "../../lib/distance";
import { toast } from "sonner";

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

type QueueStatus = "available" | "finishing" | "busy";
type FilterOption = "all" | "available" | "shortest";

interface Salon {
  id: number;
  name: string;
  address: string | null;
  category: string | null;
  rating: string | null;
  reviewCount: number | null;
  queueStatus: QueueStatus;
  waitTime: number;
  waitingCount?: number;
  latitude: string | null;
  longitude: string | null;
  distanceKm?: number;
}

function LiveDashboard() {
  const { location } = useLocation();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [activeQueue, setActiveQueue] = useState<any | null>(null);

  const loadSalons = async () => {
    try {
      const data = await getSalons({ data: {} });
      if (data && Array.isArray(data)) {
        const processed = data.map((s: any) => {
          let dist: number | undefined;
          if (location && s.latitude && s.longitude) {
            dist = calculateDistance(
              location.latitude,
              location.longitude,
              parseFloat(s.latitude),
              parseFloat(s.longitude)
            );
          }
          return {
            ...s,
            queueStatus: s.queueStatus || "available",
            waitTime: s.waitTime || 0,
            waitingCount: s.waitingCount || Math.floor((s.waitTime || 0) / 15),
            distanceKm: dist,
          };
        });
        setSalons(processed);
      }
    } catch (err) {
      console.error("Failed to load salons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalons();
    const interval = setInterval(loadSalons, 10000);
    return () => clearInterval(interval);
  }, [location]);

  const categories = [
    { id: 'all', name: 'All', icon: '✨' },
    { id: 'haircut', name: 'Haircut', icon: '💇‍♂️' },
    { id: 'beard', name: 'Beard Trim', icon: '🧔' },
    { id: 'facial', name: 'Facial & Spa', icon: '💆‍♀️' },
    { id: 'color', name: 'Hair Color', icon: '🎨' },
    { id: 'styling', name: 'Styling', icon: '✂️' },
  ];

  const handleJoinQueue = (salon: Salon) => {
    setActiveQueue({
      salonName: salon.name,
      position: (salon.waitingCount || 0) + 1,
      waitTime: (salon.waitingCount || 0) * 15 + 5,
    });
    setSelectedSalon(null);
    toast.success(`Joined queue at ${salon.name}!`);
  };

  const filteredSalons = salons.filter(s => {
    if (search) {
      return (
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(search.toLowerCase())) ||
        (s.address && s.address.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (
      activeCategory !== 'All' &&
      s.category &&
      !s.category.toLowerCase().includes(activeCategory.toLowerCase()) &&
      !s.name.toLowerCase().includes(activeCategory.toLowerCase())
    ) {
      return false;
    }
    if (activeFilter === "available") return s.queueStatus === "available";
    if (activeFilter === "shortest") return s.waitTime <= 15;
    return true;
  });

  filteredSalons.sort((a, b) => {
    if (a.distanceKm !== undefined && b.distanceKm !== undefined) return a.distanceKm - b.distanceKm;
    return a.waitTime - b.waitTime;
  });

  const shortestSalons = [...salons].sort((a, b) => a.waitTime - b.waitTime).slice(0, 4);

  const [selectedLocality, setSelectedLocality] = useState("Patia, Bhubaneswar");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const localities = [
    "Patia, Bhubaneswar",
    "Saheed Nagar, Bhubaneswar",
    "Jaydev Vihar, Bhubaneswar",
    "Janpath, Bhubaneswar",
    "KIIT Square, Bhubaneswar"
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1613] font-sans pb-24">
      {/* ─── Top Brand Navbar ─── */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E8E2D9] px-4 py-3 sm:px-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <SneprWordmark height={30} className="text-[#1C1613]" />
          </Link>

          {/* Location Delivery Selector Pill */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-2.5 bg-[#FAF7F2] hover:bg-[#FAF2EA] border border-[#E8E2D9] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#1C1613] shadow-xs cursor-pointer transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#7A4B29]" />
            <span className="truncate max-w-[140px] sm:max-w-[220px]">{selectedLocality}</span>
            <span className="text-[10px] text-[#7A4B29] bg-[#7A4B29]/10 px-2 py-0.5 rounded-full font-black uppercase">Change</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 bg-[#7A4B29] text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>LIVE QUEUES</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-8">
        {/* ─── Search Bar ─── */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C948D]" />
          <input
            type="text"
            placeholder="Search salons, services, categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-4 bg-white rounded-2xl border border-[#E8E2D9] shadow-xs text-sm text-[#1C1613] placeholder-[#9C948D] focus:outline-none focus:ring-2 focus:ring-[#7A4B29]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9C948D] hover:text-[#1C1613]"
            >
              Clear
            </button>
          )}
        </div>

        {/* ─── Live Status Ticker Banner ─── */}
        <div className="flex items-center gap-2.5 bg-[#FAF2EA] border border-[#E8D6C5] px-4 py-2.5 rounded-2xl mb-6 text-xs text-[#1C1613]">
          <span className="w-2 h-2 rounded-full bg-[#7A4B29] animate-pulse" />
          <span>
            <strong className="font-extrabold text-[#7A4B29]">Real-time chair updates</strong> • {selectedLocality}
          </span>
        </div>

        {/* ─── Quick Category Grid ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-extrabold border transition-all shrink-0",
                activeCategory === cat.name
                  ? "bg-[#7A4B29] text-white border-[#7A4B29] shadow-sm"
                  : "bg-white text-[#6E6761] border-[#E8E2D9] hover:bg-[#FAF7F2]"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ─── Filter Chips ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          <button
            onClick={() => setActiveFilter("all")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-extrabold border transition-all shrink-0",
              activeFilter === "all"
                ? "bg-[#7A4B29] text-white border-[#7A4B29]"
                : "bg-white text-[#1C1613] border-[#E8E2D9] hover:bg-[#FAF7F2]"
            )}
          >
            All Salons ({salons.length})
          </button>
          <button
            onClick={() => setActiveFilter("shortest")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-extrabold border transition-all shrink-0",
              activeFilter === "shortest"
                ? "bg-[#7A4B29] text-white border-[#7A4B29]"
                : "bg-white text-[#1C1613] border-[#E8E2D9] hover:bg-[#FAF7F2]"
            )}
          >
            Shortest Wait (&le;15 min)
          </button>
          <button
            onClick={() => setActiveFilter("available")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-extrabold border transition-all shrink-0",
              activeFilter === "available"
                ? "bg-[#7A4B29] text-white border-[#7A4B29]"
                : "bg-white text-[#1C1613] border-[#E8E2D9] hover:bg-[#FAF7F2]"
            )}
          >
            Available Now
          </button>
        </div>

        {/* ─── Section: SHORTEST WAIT NEAR YOU ─── */}
        {shortestSalons.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#9C948D]">
                  Shortest Wait Near You
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {shortestSalons.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-[#E8E2D9] shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#7A4B29] font-black flex items-center justify-center text-sm">
                        {item.name[0]}
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FAF2EA] text-[#7A4B29]">
                        {item.queueStatus}
                      </span>
                    </div>

                    <div className="text-3xl font-black text-[#1C1613] leading-none mb-1">
                      {item.waitTime} <span className="text-xs font-bold text-[#9C948D]">min</span>
                    </div>
                    <div className="text-[11px] text-[#9C948D] mb-3">
                      {item.distanceKm ? formatDistance(item.distanceKm) : 'Nearby'}
                    </div>

                    <h3 className="text-sm font-extrabold text-[#1C1613] truncate mb-1" title={item.name}>
                      {item.name}
                    </h3>
                    <div className="text-xs text-[#6E6761] mb-3">
                      ⭐ {item.rating || '4.8'} • {item.category || 'Salon'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinQueue(item)}
                    className="w-full py-2 bg-[#7A4B29] hover:bg-[#5C371D] text-white font-extrabold text-xs rounded-xl transition-all"
                  >
                    JOIN QUEUE
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Section: ALL SALONS NEAR YOU ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#9C948D]">
              All Salons Near You ({filteredSalons.length})
            </h2>
          </div>

          {loading ? (
            <div className="py-20 text-center text-[#9C948D]">Loading live salons from database...</div>
          ) : filteredSalons.length === 0 ? (
            <div className="py-20 text-center text-[#9C948D]">No salons found matching your search.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSalons.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#7A4B29] font-black flex items-center justify-center text-base shrink-0">
                          {item.name[0]}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-[#1C1613] leading-snug">{item.name}</h3>
                          <p className="text-xs text-[#9C948D]">
                            {item.category || 'Salon'} • {item.distanceKm ? formatDistance(item.distanceKm) : 'Nearby'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#7A4B29] bg-[#FAF2EA] px-2.5 py-1 rounded-full shrink-0">
                        ⭐ {item.rating || '4.8'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-[#FAF7F2] p-3 rounded-xl mb-4">
                      <div>
                        <div className="text-[10px] font-bold text-[#9C948D] uppercase">Est. Wait</div>
                        <div className="text-lg font-black text-[#1C1613]">{item.waitTime} mins</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-[#9C948D] uppercase">Live Queue</div>
                        <div className="text-sm font-extrabold text-[#7A4B29]">{item.waitingCount} in line</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSalon(item)}
                      className="flex-1 py-2.5 border border-[#E8E2D9] hover:bg-[#FAF7F2] text-[#1C1613] font-bold text-xs rounded-xl transition-all"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleJoinQueue(item)}
                      className="flex-1 py-2.5 bg-[#7A4B29] hover:bg-[#5C371D] text-white font-extrabold text-xs rounded-xl transition-all"
                    >
                      Join Queue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ─── Persistent Active Queue Bar ─── */}
      {activeQueue && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 bg-[#1C1613] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7A4B29] flex items-center justify-center text-lg">
              ⏱️
            </div>
            <div>
              <div className="font-extrabold text-xs text-amber-400">Queue Confirmed</div>
              <div className="font-bold text-sm truncate max-w-[180px]">{activeQueue.salonName}</div>
              <div className="text-[11px] text-white/70">Pos #{activeQueue.position} • ~{activeQueue.waitTime} mins left</div>
            </div>
          </div>
          <button
            onClick={() => setActiveQueue(null)}
            className="text-xs font-bold text-white/60 hover:text-white px-2.5 py-1 rounded-lg bg-white/10"
          >
            Close
          </button>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {selectedSalon && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedSalon(null)}
              className="absolute top-4 right-4 p-2 text-[#9C948D] hover:text-[#1C1613]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#FAF2EA] text-[#7A4B29] font-black text-xl flex items-center justify-center mb-3">
              {selectedSalon.name[0]}
            </div>

            <h3 className="text-xl font-extrabold text-[#1C1613]">{selectedSalon.name}</h3>
            <p className="text-xs text-[#9C948D] mt-1 mb-4">{selectedSalon.address || 'Patia, Bhubaneswar'}</p>

            <div className="grid grid-cols-3 gap-2 bg-[#FAF7F2] p-3 rounded-2xl mb-6 text-center">
              <div>
                <div className="text-[10px] font-bold text-[#9C948D]">Est. Wait</div>
                <div className="text-base font-black text-[#1C1613]">{selectedSalon.waitTime} min</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#9C948D]">In Queue</div>
                <div className="text-base font-black text-[#7A4B29]">{selectedSalon.waitingCount}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#9C948D]">Rating</div>
                <div className="text-base font-black text-[#1C1613]">⭐ {selectedSalon.rating || '4.8'}</div>
              </div>
            </div>

            <button
              onClick={() => handleJoinQueue(selectedSalon)}
              className="w-full py-3.5 bg-[#7A4B29] hover:bg-[#5C371D] text-white font-extrabold text-sm rounded-2xl transition-all shadow-md"
            >
              Join Live Queue Now
            </button>
          </div>
        </div>
      )}

      {/* ─── Location Selection Modal ─── */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowLocationModal(false)}
              className="absolute top-4 right-4 p-2 text-[#9C948D] hover:text-[#1C1613]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-[#1C1613] mb-4">Select Location</h3>

            <div className="space-y-2 mb-4">
              {localities.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setSelectedLocality(item);
                    setShowLocationModal(false);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-between",
                    selectedLocality === item
                      ? "bg-[#7A4B29] text-white border-[#7A4B29]"
                      : "bg-[#FAF7F2] text-[#1C1613] border-[#E8E2D9] hover:bg-[#FAF2EA]"
                  )}
                >
                  <span>📍 {item}</span>
                  {selectedLocality === item && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
