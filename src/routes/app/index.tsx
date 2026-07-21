import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  component: AppHome,
});

function AppHome() {
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
        {[1, 2, 3, 4, 5].map((i) => (
          <Link 
            key={i} 
            to={`/app/salon/${i}`}
            className="press flex flex-col gap-3 rounded-[24px] border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex gap-4">
              <div className="h-[72px] w-[72px] shrink-0 rounded-2xl bg-surface-2 object-cover border border-border/50" />
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-semibold text-[16px] text-ink truncate mb-1">Premium Salon {i}</h3>
                <p className="text-[13px] text-ink-soft flex items-center gap-1.5">
                  <span className="live-dot"></span> Live wait time
                </p>
              </div>
              <div className="flex flex-col items-center justify-center shrink-0 min-w-[56px] h-[56px] rounded-2xl bg-surface-2">
                <span className="text-[18px] font-bold text-ink -mb-1">{12 + i * 2}</span>
                <span className="text-[10px] font-medium text-ink-soft uppercase tracking-wider">min</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
