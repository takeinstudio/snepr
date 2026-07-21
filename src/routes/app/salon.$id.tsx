import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/salon/$id")({
  component: AppSalonDetail,
});

function AppSalonDetail() {
  const { id } = Route.useParams();

  return (
    <div className="flex flex-col h-full bg-surface-2">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background p-4 shadow-sm">
        <Link to="/app" className="rounded-full p-2.5 hover:bg-surface-2 transition-colors active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="font-semibold text-lg text-ink font-display">Salon Detail</h1>
      </div>

      <div className="flex flex-col items-center gap-1 py-10 bg-background text-center px-4 rounded-b-[32px] shadow-sm mb-6 relative">
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-surface-2 rounded-full border-4 border-background flex items-center justify-center">
          <span className="live-dot" style={{ '--color-status-available': 'var(--primary)' } as any}></span>
        </div>
        <p className="text-[13px] font-semibold tracking-wide uppercase text-ink-soft">Live Queue</p>
        <h2 className="text-[40px] font-display font-bold tracking-tight text-ink mt-2">
          {4 + Number(id)} <span className="text-2xl text-ink-soft font-medium">waiting</span>
        </h2>
        <p className="text-base text-ink-soft font-medium mt-1">~23 min estimated</p>
      </div>

      <div className="flex-1 px-4 flex flex-col gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-ink-soft uppercase tracking-wider pl-1">Barber Status</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm border border-border">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-[15px] font-medium text-ink">Available (John)</span>
              </div>
              <span className="text-[13px] font-bold text-ink-soft bg-surface-2 px-2.5 py-1 rounded-lg">3 min</span>
            </div>
            
            <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm border border-border opacity-60">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-destructive" />
                <span className="text-[15px] font-medium text-ink">With Customer</span>
              </div>
              <span className="text-[13px] font-bold text-ink-soft bg-surface-2 px-2.5 py-1 rounded-lg">23 min</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-background mt-auto pb-8 pt-4 rounded-t-[24px] shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <Link 
          to="/app/queue"
          className="press flex w-full items-center justify-center rounded-[20px] bg-primary px-4 py-4.5 text-[16px] font-semibold text-primary-foreground shadow-md hover:bg-primary-hover active:scale-[0.98]"
        >
          Join Queue Now
        </Link>
      </div>
    </div>
  );
}
