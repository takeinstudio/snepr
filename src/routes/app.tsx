import { Outlet, createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { SneprLogoMark } from "../components/SneprLogoMark";
import { Home, ListOrdered, Activity, User } from "lucide-react";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex h-screen flex-col bg-background font-sans text-ink overflow-hidden selection:bg-primary/20">
      {/* Top Bar */}
      <header className="flex h-14 shrink-0 items-center justify-center border-b border-border/50 bg-background/95 backdrop-blur-md px-4">
        <SneprLogoMark height={24} className="text-primary" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/20 pb-16">
        <Outlet />
      </main>

      {/* Bottom Tab Bar */}
      <nav className="absolute bottom-0 w-full flex h-16 shrink-0 items-center justify-around border-t border-border/50 bg-background/95 backdrop-blur-md pb-safe">
        <TabLink to="/app" icon={Home} label="Home" />
        <TabLink to="/app/queue" icon={ListOrdered} label="Queue" />
        <TabLink to="/app/activity" icon={Activity} label="Activity" />
        <TabLink to="/app/profile" icon={User} label="Profile" />
      </nav>
    </div>
  );
}

function TabLink({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
