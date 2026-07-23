import { createFileRoute, Link } from "@tanstack/react-router";
import { getSalons } from "../../backend/functions/salons";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "../../hooks/useLocation";
import { calculateDistance, formatDistance } from "../../lib/distance";
import { useMemo, useState } from "react";
import { MapPin, ChevronDown, Search } from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: AppHome,
});

function AppHome() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: salons, isLoading } = useQuery({
    queryKey: ["salons"],
    queryFn: () => getSalons({ data: {} }),
  });

  const { location, requestGpsLocation } = useLocation();

  const sortedSalons = useMemo(() => {
    if (!salons) return [];
    
    return (salons as any[]).map((salon: any) => {
      let distanceKm: number | undefined;
      if (location && salon.latitude && salon.longitude) {
        distanceKm = calculateDistance(
          location.latitude,
          location.longitude,
          parseFloat(salon.latitude),
          parseFloat(salon.longitude)
        );
      }
      return { ...salon, distanceKm };
    }).sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== undefined) return -1;
      if (b.distanceKm !== undefined) return 1;
      return 0;
    }).filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || (s.address || "").toLowerCase().includes(q) || (s.category || "").toLowerCase().includes(q);
    });
  }, [salons, location, searchQuery]);

  return (
    <div className="flex flex-col p-4 pb-20 bg-background min-h-screen">
      
      {/* Location Header - Zomato Style */}
      <div className="flex items-center gap-3 mb-6" onClick={() => requestGpsLocation()}>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-1">
            <h2 className="text-[16px] font-bold text-ink flex items-center gap-1 cursor-pointer hover:opacity-80 active:opacity-60 transition-opacity">
              Current Location <ChevronDown className="w-4 h-4 text-primary" />
            </h2>
          </div>
          <p className="text-[13px] text-ink-soft truncate">
            {location ? "Using your device location" : "Click to refresh location"}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center shrink-0 border border-border shadow-sm">
          <span className="font-bold text-ink">U</span>
        </div>
      </div>

      <div className="sticky top-0 z-10 -mx-4 px-4 pb-4 bg-background/95 backdrop-blur-md pt-2">
        <div className="relative shadow-sm rounded-2xl">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for salons, services, or places..." 
            className="w-full rounded-2xl border border-border bg-surface-1 px-11 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-4">
        {isLoading && <p className="text-center text-ink-soft mt-10">Loading salons...</p>}
        {sortedSalons?.map((salon: any) => (
          <Link 
            key={salon.id} 
            to={`/app/salon/${salon.id}` as any}
            className="press flex flex-col gap-3 rounded-[24px] border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex gap-4">
              <div className="h-[80px] w-[80px] shrink-0 rounded-2xl bg-surface-2 object-cover border border-border/50 flex items-center justify-center text-2xl">
                ✂️
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-semibold text-[16px] text-ink truncate">{salon.name}</h3>
                
                {salon.rating && (
                  <div className="flex items-center gap-1 mt-0.5 mb-1.5">
                    <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="text-[12px] font-bold text-ink">{salon.rating}</span>
                    <span className="text-[12px] text-ink-soft">({salon.reviewCount})</span>
                  </div>
                )}
                
                <p className="text-[12px] text-ink-soft truncate mb-1.5">
                  {salon.address}
                  {salon.distanceKm !== undefined && (
                    <span className="ml-1 text-primary font-medium">· {formatDistance(salon.distanceKm)}</span>
                  )}
                </p>

                <p className="text-[13px] text-ink-soft flex items-center gap-1.5">
                  <span className="live-dot" style={{ '--color-status-available': salon.status === 'open' ? 'var(--primary)' : 'var(--muted-foreground)' } as any}></span> 
                  <span className={salon.status === 'open' ? 'text-ink font-medium' : ''}>{salon.status === 'open' ? 'Live wait time' : 'Closed'}</span>
                </p>
              </div>
              
              {salon.status === 'open' && (
                <div className="flex flex-col items-center justify-center shrink-0 min-w-[56px] h-[56px] rounded-2xl bg-surface-2 self-center">
                  <span className="text-[18px] font-bold text-ink -mb-1">{salon.waitTime || 0}</span>
                  <span className="text-[10px] font-medium text-ink-soft uppercase tracking-wider">min</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
