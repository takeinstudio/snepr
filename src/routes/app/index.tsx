import { createFileRoute, Link } from "@tanstack/react-router";
import { getSalons } from "../../../server/functions/salons";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/app/")({
  component: AppHome,
});

function AppHome() {
  const { data: salons, isLoading } = useQuery({
    queryKey: ["salons"],
    queryFn: () => getSalons(),
  });

  return (
    <div className="flex flex-col p-4 pb-20">
      <div className="space-y-1 mb-6 px-1 mt-2">
        <h1 className="text-3xl font-display font-bold tracking-tight text-ink">Snepr</h1>
        <p className="text-sm text-ink-soft">Live queue and wait times</p>
      </div>

      <div className="sticky top-0 z-10 -mx-4 px-4 pb-4 bg-gradient-to-b from-background to-transparent pt-2">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search salons near you..." 
            className="w-full rounded-2xl border-none bg-surface-2 px-5 py-3.5 text-[15px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-4">
        {isLoading && <p className="text-center text-ink-soft mt-10">Loading salons...</p>}
        {salons?.map((salon) => (
          <Link 
            key={salon.id} 
            to={`/app/salon/${salon.id}`}
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
                
                <p className="text-[12px] text-ink-soft truncate mb-1.5">{salon.address}</p>

                <p className="text-[13px] text-ink-soft flex items-center gap-1.5">
                  <span className="live-dot" style={{ '--color-status-available': salon.status === 'open' ? 'var(--primary)' : 'var(--muted-foreground)' } as any}></span> 
                  <span className={salon.status === 'open' ? 'text-ink font-medium' : ''}>{salon.status === 'open' ? 'Live wait time' : 'Closed'}</span>
                </p>
              </div>
              
              {salon.status === 'open' && (
                <div className="flex flex-col items-center justify-center shrink-0 min-w-[56px] h-[56px] rounded-2xl bg-surface-2 self-center">
                  <span className="text-[18px] font-bold text-ink -mb-1">{salon.estimatedWaitTimeMins}</span>
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
