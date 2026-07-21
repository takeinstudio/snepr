import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/live/activity")({
  component: AppActivity,
});

function AppActivity() {
  return (
    <div className="flex flex-col gap-6 p-6 h-full">
      <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
      
      <div className="flex-1 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground mt-2">Past Visits</h2>
        
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-card shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-muted flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">Salon {i} Name</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Oct {i * 4}, 2023 • Haircut</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-semibold text-sm">₹180</span>
              <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full mt-1">Completed</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
