import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/queue")({
  component: AppQueue,
});

function AppQueue() {
  return (
    <div className="flex flex-col h-full bg-surface-2">
      <div className="flex items-center gap-3 p-4 bg-background">
        <Link to="/app" className="rounded-full p-2.5 hover:bg-surface-2 transition-colors active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="font-semibold text-lg text-ink font-display">Digital Token</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-10 px-4">
        {/* Ticket UI */}
        <div className="w-full max-w-[300px] bg-card rounded-[32px] shadow-lg border border-border/50 relative overflow-hidden">
          {/* Top of ticket */}
          <div className="p-8 pb-4 text-center border-b-2 border-dashed border-border/60">
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider mb-2">Token Number</p>
            <span className="text-[72px] font-display font-bold tracking-tighter text-ink leading-none block">
              425
            </span>
          </div>
          {/* Bottom of ticket */}
          <div className="p-6 pt-4 text-center bg-background">
            <span className="text-[13px] font-medium text-ink-soft">
              On your way - tap when you arrive
            </span>
          </div>
          
          {/* Ticket cutouts */}
          <div className="absolute top-[124px] -left-4 w-8 h-8 bg-surface-2 rounded-full border-r border-border/50" />
          <div className="absolute top-[124px] -right-4 w-8 h-8 bg-surface-2 rounded-full border-l border-border/50" />
        </div>
      </div>

      <div className="bg-background mt-auto p-6 pt-8 rounded-t-[32px] shadow-[0_-4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[12px] font-bold uppercase tracking-wider text-ink-soft px-1">
            <span>Far</span>
            <span>Approaching</span>
            <span className="text-primary">Arrived</span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-surface-2 overflow-hidden shadow-inner">
            <div className="absolute left-0 top-0 h-full w-3/4 bg-primary rounded-full" />
          </div>
        </div>

        <Link 
          to="/app/checkout"
          className="press flex w-full items-center justify-center rounded-[20px] bg-primary px-4 py-4.5 text-[16px] font-bold text-primary-foreground shadow-md hover:bg-primary-hover active:scale-[0.98]"
        >
          I'm Here
        </Link>
      </div>
    </div>
  );
}
