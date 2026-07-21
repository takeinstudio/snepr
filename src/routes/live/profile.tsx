import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/live/profile")({
  component: AppProfile,
});

function AppProfile() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      
      <div className="flex items-center gap-4 p-4 bg-accent/30 rounded-2xl border border-border/50">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
          S
        </div>
        <div>
          <h2 className="font-semibold">Snepr User</h2>
          <p className="text-sm text-muted-foreground">+91 98765 43210</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <div className="p-4 rounded-xl border border-border/50 flex justify-between items-center bg-card shadow-sm hover:bg-accent/50 transition-colors cursor-pointer">
          <span className="font-medium text-sm">Payment Methods</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m9 18 6-6-6-6"/></svg>
        </div>
        <div className="p-4 rounded-xl border border-border/50 flex justify-between items-center bg-card shadow-sm hover:bg-accent/50 transition-colors cursor-pointer">
          <span className="font-medium text-sm">Favorite Salons</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m9 18 6-6-6-6"/></svg>
        </div>
        <div className="p-4 rounded-xl border border-border/50 flex justify-between items-center bg-card shadow-sm hover:bg-accent/50 transition-colors cursor-pointer">
          <span className="font-medium text-sm">Settings</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>

      <button className="mt-auto p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors">
        Log Out
      </button>
    </div>
  );
}
