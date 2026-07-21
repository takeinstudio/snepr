import { createFileRoute } from "@tanstack/react-router";
import { login, type SessionUser } from "../../backend/functions/auth";
import { getSalonById, getSalonStats } from "../../backend/functions/salons";
import { getLiveQueue, callNext, skipCustomer, completeService, getStaff } from "../../backend/functions/queues";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard, Users, Scissors, BookOpen, BarChart2, Settings,
  LogOut, ArrowRight, Star, Clock, CheckCircle, SkipForward,
  ChevronRight, Zap, DollarSign, Bell
} from "lucide-react";
import { SneprWordmark } from "@/components/SneprWordmark";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/salon/")({
  component: SalonDashboard,
});

type SalonTab = "Overview" | "Live Queue" | "Bookings" | "Staff" | "Services" | "Finance" | "Analytics" | "Settings";

const SALON_SIDEBAR: { name: SalonTab; icon: any }[] = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Live Queue", icon: Zap },
  { name: "Bookings", icon: BookOpen },
  { name: "Staff", icon: Users },
  { name: "Services", icon: Scissors },
  { name: "Finance", icon: DollarSign },
  { name: "Analytics", icon: BarChart2 },
  { name: "Settings", icon: Settings },
];

// ─── Root ─────────────────────────────────────────────────────────────────────

function SalonDashboard() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => login({ data: { username, password } }),
    onSuccess: (data) => { setSession(data); setLoginError(""); },
    onError: () => setLoginError("Invalid credentials"),
  });

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] px-4">
      <div className="w-full max-w-sm">
        <SneprWordmark height={32} className="text-ink mb-10 mx-auto" />
        <h2 className="text-[30px] font-display text-ink mb-2">Salon Portal</h2>
        <p className="text-ink-soft text-[14px] mb-8">Access your salon management dashboard.</p>
        {loginError && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-[13px] rounded-lg border border-destructive/20">{loginError}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-ink-soft uppercase tracking-wider mb-2">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && loginMutation.mutate()}
              className="w-full px-4 py-4 rounded-xl bg-white border border-border/80 focus:ring-2 focus:ring-primary/30 text-[15px] outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-ink-soft uppercase tracking-wider mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && loginMutation.mutate()}
              className="w-full px-4 py-4 rounded-xl bg-white border border-border/80 focus:ring-2 focus:ring-primary/30 text-[15px] outline-none font-mono" />
          </div>
          <button onClick={() => loginMutation.mutate()} disabled={loginMutation.isPending}
            className="w-full h-14 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            <ArrowRight className="w-5 h-5" />
            {loginMutation.isPending ? "Signing in…" : "Sign In"}
          </button>
        </div>
        <p className="mt-8 text-center text-[12px] text-ink-softer">
          © {new Date().getFullYear()} Snepr Technologies. All rights reserved.
        </p>
      </div>
    </div>
  );

  if (!["super_admin", "sub_admin", "salon_owner", "staff"].includes(session.role)) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-ink-soft">Access denied.</p></div>;
  }

  return <SalonShell session={session} onLogout={() => setSession(null)} />;
}

// ─── Shell ────────────────────────────────────────────────────────────────────

function SalonShell({ session, onLogout }: { session: SessionUser; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<SalonTab>("Overview");

  const visibleLinks = session.role === "staff"
    ? SALON_SIDEBAR.filter(s => ["Live Queue", "Bookings"].includes(s.name))
    : SALON_SIDEBAR;

  return (
    <div className="flex h-screen bg-[#f8f6f3] font-sans text-ink overflow-hidden">
      <aside className="w-[260px] shrink-0 border-r border-border/50 bg-white flex flex-col z-20">
        <div className="p-6 flex flex-col items-center border-b border-border/20">
          <SneprWordmark height={28} className="text-primary mb-3" />
          <div className="inline-flex px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
            Salon Console
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {visibleLinks.map(link => (
            <button key={link.name} onClick={() => setActiveTab(link.name)}
              className={cn(
                "w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[13.5px] font-medium transition-all",
                activeTab === link.name
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-ink-soft hover:bg-black/[0.03] hover:text-ink"
              )}>
              <link.icon className="w-4.5 h-4.5 shrink-0" strokeWidth={activeTab === link.name ? 2.5 : 2} />
              {link.name}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border/40">
          <div className="px-3.5 py-2 mb-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-softer mb-0.5">Signed in as</div>
            <div className="text-[13px] font-semibold text-ink">{session.username}</div>
          </div>
          <button onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[13.5px] font-medium text-ink-soft hover:bg-black/[0.03] transition-colors">
            <LogOut className="w-4.5 h-4.5" />
            Exit
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] shrink-0 bg-white border-b border-border/40 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-[22px] font-display font-semibold text-ink">{activeTab}</h1>
          <div className="flex items-center gap-6">
            <button className="relative text-ink-soft hover:text-ink transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-bold text-base shadow-sm">
                {session.username[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "Overview" && <SalonOverview session={session} />}
          {activeTab === "Live Queue" && <LiveQueueTab session={session} />}
          {activeTab === "Staff" && <StaffTab session={session} />}
          {!["Overview", "Live Queue", "Staff"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Scissors className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-[22px] font-display font-semibold text-ink mb-2">{activeTab}</h2>
              <p className="text-[14px] text-ink-soft max-w-sm">This section is being built and will be ready soon.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Salon Overview ───────────────────────────────────────────────────────────

function SalonOverview({ session }: { session: SessionUser }) {
  const salonId = session.salonId ?? 1;

  const { data: stats } = useQuery({
    queryKey: ["salon-stats", salonId],
    queryFn: () => getSalonStats({ data: { callerRole: session.role, salonId } }),
    refetchInterval: 15000,
  });

  const { data: salon } = useQuery({
    queryKey: ["salon", salonId],
    queryFn: async () => (await getSalonById({ data: { id: salonId } })) as any,
  });

  return (
    <div>
      {salon && (
        <div className="mb-6">
          <h2 className="text-[20px] font-display font-bold text-ink">{salon.name}</h2>
          <p className="text-ink-soft text-[13px] mt-1">{salon.address ?? "No address set"} · {salon.category ?? "Salon"}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={BookOpen} label="Today's Bookings" value={stats?.todayBookings ?? 0} accent />
        <StatCard icon={Users} label="Customers Waiting" value={stats?.customersWaiting ?? 0} />
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${((stats?.totalRevenue ?? 0) / 100).toLocaleString()}`} green />
      </div>

      <div className="bg-white rounded-2xl border border-border/40 shadow-sm p-8 text-center text-ink-softer">
        <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
        <p className="text-[14px]">Bookings and live queue activity will appear here as customers join.</p>
      </div>
    </div>
  );
}

// ─── Live Queue Tab ───────────────────────────────────────────────────────────

function LiveQueueTab({ session }: { session: SessionUser }) {
  const queryClient = useQueryClient();
  const salonId = session.salonId ?? 1;

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ["live-queue", salonId],
    queryFn: () => getLiveQueue({ data: { salonId } }),
    refetchInterval: 5000,
  });

  const callMutation = useMutation({
    mutationFn: () => callNext({ data: { callerRole: session.role, salonId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["live-queue"] }),
  });

  const completeMutation = useMutation({
    mutationFn: (queueId: number) => completeService({ data: { callerRole: session.role, queueId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["live-queue"] }),
  });

  const skipMutation = useMutation({
    mutationFn: (queueId: number) => skipCustomer({ data: { callerRole: session.role, queueId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["live-queue"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[13px] font-semibold text-ink-soft">{queue.length} waiting</span>
        </div>
        <button onClick={() => callMutation.mutate()} disabled={!queue.length || callMutation.isPending}
          className="px-5 py-2.5 bg-primary text-primary-foreground text-[13px] font-bold rounded-xl flex items-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-50">
          <ChevronRight className="w-4 h-4" />
          Call Next
        </button>
      </div>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-ink-soft">Loading queue…</div>
      ) : queue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/40 p-20 text-center text-ink-softer">
          No customers in the queue right now.
        </div>
      ) : (
        <div className="space-y-3">
          {queue.sort((a, b) => a.tokenNumber - b.tokenNumber).map((entry, i) => (
            <div key={entry.id} className={cn(
              "bg-white rounded-2xl border shadow-sm px-6 py-4 flex items-center justify-between transition-all",
              i === 0 ? "border-primary/40 ring-1 ring-primary/20" : "border-border/40"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-lg",
                  i === 0 ? "bg-primary text-primary-foreground" : "bg-surface text-ink"
                )}>
                  #{entry.tokenNumber}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-ink">
                    {i === 0 ? "Next up" : `Position ${i + 1}`}
                  </div>
                  <div className="text-[12px] text-ink-soft font-mono mt-0.5">
                    ~{entry.estimatedWaitMins ?? (i * 15)} min wait
                  </div>
                </div>
              </div>
              {i === 0 && (
                <div className="flex items-center gap-2">
                  <button onClick={() => completeMutation.mutate(entry.id)}
                    className="px-3 py-1.5 bg-green-50 text-green-700 text-[12px] font-bold rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Done
                  </button>
                  <button onClick={() => skipMutation.mutate(entry.id)}
                    className="px-3 py-1.5 bg-gray-50 text-gray-600 text-[12px] font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5">
                    <SkipForward className="w-3.5 h-3.5" />
                    Skip
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Staff Tab ─────────────────────────────────────────────────────────────────

function StaffTab({ session }: { session: SessionUser }) {
  const salonId = session.salonId ?? 1;
  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ["staff", salonId],
    queryFn: async () => (await getStaff({ data: { salonId } })) as any[],
  });

  return (
    <div>
      <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-ink">Staff Members ({staffList.length})</h2>
        </div>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center text-ink-soft">Loading…</div>
        ) : staffList.length === 0 ? (
          <div className="p-16 text-center text-ink-softer">No staff added yet.</div>
        ) : (
          <div className="divide-y divide-border/30">
            {staffList.map((s: any) => (
              <div key={s.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface text-ink flex items-center justify-center font-bold">
                    {s.userId}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-ink">Staff #{s.userId}</div>
                    <div className="text-[12px] text-ink-soft capitalize">{s.role}</div>
                  </div>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-bold",
                  s.breakMode ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                )}>
                  {s.breakMode ? "On Break" : "Available"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, accent, green }: {
  icon: any; label: string; value: number | string; accent?: boolean; green?: boolean;
}) {
  const color = accent ? "text-primary" : green ? "text-green-600" : "text-ink";
  return (
    <div className="bg-white rounded-2xl border border-border/40 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-ink-softer">{label}</span>
        <Icon className="w-4 h-4 text-ink-softer" />
      </div>
      <div className={cn("text-[36px] font-display font-bold leading-none", color)}>{value}</div>
    </div>
  );
}
