import { createFileRoute, Link } from "@tanstack/react-router";
import { login, createSubAdmin, getAllUsers, getCities, createCity, type SessionUser, type UserRole } from "../../backend/functions/auth";
import { getSalons, getPlatformStats, approveSalon, rejectSalon, suspendSalon } from "../../backend/functions/salons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard, Users, Store, BookOpen, BarChart2, Settings,
  LogOut, Bell, ArrowRight, ShieldCheck, Megaphone, FileText,
  DollarSign, Globe, AlertTriangle, CheckCircle, XCircle, Ban,
  Plus, Search, ChevronRight, Zap, TrendingUp
} from "lucide-react";
import { SneprWordmark } from "@/components/SneprWordmark";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab =
  | "Overview" | "Live Monitor" | "Salon Management" | "User Management"
  | "Booking Management" | "Financials" | "Marketing" | "CMS"
  | "Analytics" | "Access Control";

const SIDEBAR: { name: Tab; icon: any; badge?: number }[] = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Live Monitor", icon: Zap },
  { name: "Salon Management", icon: Store },
  { name: "User Management", icon: Users },
  { name: "Booking Management", icon: BookOpen },
  { name: "Financials", icon: DollarSign },
  { name: "Marketing", icon: Megaphone },
  { name: "CMS", icon: FileText },
  { name: "Analytics", icon: BarChart2 },
  { name: "Access Control", icon: ShieldCheck },
];

// ─── Shell ────────────────────────────────────────────────────────────────────

function AdminDashboard() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => login({ data: { username, password } }),
    onSuccess: (data) => { setSession(data); setLoginError(""); },
    onError: () => setLoginError("Invalid credentials"),
  });

  if (!session) {
    return <LoginScreen
      username={username} setUsername={setUsername}
      password={password} setPassword={setPassword}
      error={loginError}
      onSubmit={() => loginMutation.mutate()}
      isPending={loginMutation.isPending}
    />;
  }

  // Role guard — only super_admin and sub_admin enter here
  if (!["super_admin", "sub_admin"].includes(session.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink">Access Denied</h1>
          <p className="text-ink-soft mt-2">You do not have permission to access this portal.</p>
          <button onClick={() => setSession(null)} className="mt-6 text-primary underline">Sign out</button>
        </div>
      </div>
    );
  }

  return <DashboardShell session={session} onLogout={() => setSession(null)} />;
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ username, setUsername, password, setPassword, error, onSubmit, isPending }: any) {
  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] min-h-screen bg-[#fdfaf6]">
      <div className="relative hidden lg:block overflow-hidden bg-ink">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop"
          alt="Premium Salon"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
        <div className="absolute top-10 left-10">
          <SneprWordmark height={24} className="text-white" />
        </div>
        <div className="absolute bottom-20 left-12 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white leading-tight">
            Elevate Your <br />
            <span className="text-[#d3a14e]">Salon</span> to the Extraordinary.
          </h1>
          <p className="mt-4 text-[16px] text-white/80 font-light max-w-md leading-relaxed">
            Snepr Admin Console — manage every salon, user, and booking on the platform.
          </p>
          <div className="mt-8 inline-flex items-center gap-4 px-6 py-3 rounded-full border border-[#d3a14e]/40 bg-ink/30 backdrop-blur-md">
            <span className="w-8 h-px bg-[#d3a14e] block" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#d3a14e] uppercase">SNEPR SUPER ADMIN</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-[#fdfaf6]">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden mb-12"><SneprWordmark height={28} className="text-ink" /></div>
          <h2 className="text-[34px] font-display text-ink mb-2 leading-tight">Welcome Back</h2>
          <p className="text-[15px] text-ink-soft mb-10 font-light">Enter your credentials to access your portal.</p>
          {error && <div className="p-3 mb-6 bg-destructive/10 text-destructive text-[13px] font-medium rounded-lg border border-destructive/20">{error}</div>}
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-ink-soft uppercase tracking-wider mb-2">Username</label>
              <input type="text" placeholder="snepr@2026" value={username} onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onSubmit()}
                className="w-full px-4 py-4 rounded-xl bg-white border border-border/80 focus:ring-2 focus:ring-[#d3a14e]/40 focus:border-[#d3a14e] transition-all text-[15px] shadow-sm outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-soft uppercase tracking-wider mb-2">Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onSubmit()}
                className="w-full px-4 py-4 rounded-xl bg-white border border-border/80 focus:ring-2 focus:ring-[#d3a14e]/40 focus:border-[#d3a14e] transition-all text-[15px] shadow-sm outline-none font-mono" />
            </div>
            <button onClick={onSubmit} disabled={isPending}
              className="w-full mt-4 h-[56px] bg-[#d3a14e] hover:bg-[#c4923e] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-60">
              {isPending ? "SIGNING IN..." : <><ArrowRight className="w-4 h-4" />SIGN IN</>}
            </button>
          </div>
          <div className="mt-20 text-center text-[12.5px] text-ink-soft/80 font-light">
            © {new Date().getFullYear()} Snepr Technologies. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Shell ──────────────────────────────────────────────────────────

function DashboardShell({ session, onLogout }: { session: SessionUser; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  // Sub admins have limited sidebar
  const visibleLinks = session.role === "sub_admin"
    ? SIDEBAR.filter(s => ["Overview", "Salon Management", "Booking Management", "Analytics", "Marketing"].includes(s.name))
    : SIDEBAR;

  return (
    <div className="flex h-screen bg-[#f8f6f3] font-sans text-ink overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[268px] shrink-0 border-r border-border/50 bg-[#fefdfb] flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-20">
        <div className="p-7 pb-6 flex flex-col items-center border-b border-border/20">
          <SneprWordmark height={30} className="text-[#d3a14e] mb-3" />
          <div className={cn(
            "inline-flex px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full",
            session.role === "super_admin"
              ? "bg-[#d3a14e]/10 text-[#d3a14e]"
              : "bg-primary/10 text-primary"
          )}>
            {session.role === "super_admin" ? "Super Admin" : `Sub Admin · ${session.cityId ? `City #${session.cityId}` : "All Cities"}`}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {visibleLinks.map(link => (
            <button key={link.name} onClick={() => setActiveTab(link.name)}
              className={cn(
                "w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[13.5px] font-medium transition-all",
                activeTab === link.name
                  ? "bg-[#d3a14e] text-white shadow-md shadow-[#d3a14e]/20"
                  : "text-ink-soft hover:bg-black/[0.03] hover:text-ink"
              )}>
              <link.icon className="w-4.5 h-4.5 shrink-0" strokeWidth={activeTab === link.name ? 2.5 : 2} />
              {link.name}
              {link.badge && (
                <span className="ml-auto bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{link.badge}</span>
              )}
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
            Exit Dashboard
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] shrink-0 bg-white border-b border-border/40 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-[22px] font-display font-semibold text-ink">{activeTab}</h1>
          <div className="flex items-center gap-6">
            <button className="relative text-ink-soft hover:text-ink transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-softer">Welcome</div>
                <div className="text-[14px] font-semibold text-[#d3a14e]">{session.username}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-bold text-base shadow-sm">
                {session.username[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "Overview" && <OverviewTab session={session} />}
          {activeTab === "Salon Management" && <SalonManagementTab session={session} />}
          {activeTab === "User Management" && <UserManagementTab session={session} />}
          {activeTab === "Access Control" && <AccessControlTab session={session} />}
          {activeTab === "Live Monitor" && <LiveMonitorTab session={session} />}
          {!["Overview", "Salon Management", "User Management", "Access Control", "Live Monitor"].includes(activeTab) && (
            <ComingSoonTab tab={activeTab} />
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ session }: { session: SessionUser }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => getPlatformStats({ data: { callerRole: session.role } }),
    refetchInterval: 30000,
  });

  return (
    <div>
      <p className="text-ink-soft text-[14px] mb-8">
        {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </p>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-ink-soft">Loading stats…</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard icon={Store} label="Total Salons" value={stats?.totalSalons ?? 0} />
          <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} />
          <StatCard icon={BookOpen} label="Total Bookings" value={stats?.totalBookings ?? 0} />
          <StatCard icon={Zap} label="Live Queues" value={stats?.liveQueues ?? 0} accent />
          <StatCard icon={CheckCircle} label="Active Salons" value={stats?.approvedSalons ?? 0} green />
          <StatCard icon={AlertTriangle} label="Pending Approvals" value={stats?.pendingSalons ?? 0} warn />
        </div>
      )}

      {/* Pending approvals quick-action */}
      {(stats?.pendingSalons ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <div className="text-[14px] font-bold text-amber-900">{stats?.pendingSalons} salons pending approval</div>
              <div className="text-[12px] text-amber-700 mt-0.5">Review and approve partner salons to go live</div>
            </div>
          </div>
          <button className="px-4 py-2 bg-amber-600 text-white text-[13px] font-bold rounded-lg hover:bg-amber-700 transition-colors">
            Review Now
          </button>
        </div>
      )}

      {/* Recent activity placeholder */}
      <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/40 flex items-center justify-between">
          <h2 className="text-[16px] font-display font-semibold text-ink">Recent Activity</h2>
          <span className="text-[11px] font-bold uppercase tracking-widest text-ink-softer font-mono">LIVE</span>
        </div>
        <div className="p-12 text-center text-ink-softer text-[14px]">
          Activity feed will populate as salons go live and bookings are made.
        </div>
      </div>
    </div>
  );
}

// ─── Salon Management Tab ─────────────────────────────────────────────────────

function SalonManagementTab({ session }: { session: SessionUser }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "suspended">("all");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: salons = [], isLoading } = useQuery({
    queryKey: ["salons-admin", session.role, session.cityId],
    queryFn: () => getSalons({ data: { callerRole: session.role, cityId: session.cityId ?? undefined } }),
  });

  const approveMutation = useMutation({
    mutationFn: (salonId: number) => approveSalon({ data: { callerRole: session.role, callerId: session.id, salonId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salons-admin"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ salonId, reason }: { salonId: number; reason: string }) =>
      rejectSalon({ data: { callerRole: session.role, salonId, reason } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["salons-admin"] }); setRejectingId(null); },
  });

  const suspendMutation = useMutation({
    mutationFn: (salonId: number) => suspendSalon({ data: { callerRole: session.role, salonId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salons-admin"] }),
  });

  const filtered = filter === "all" ? salons : salons.filter(s => s.approvalStatus === filter);

  const STATUS_COLOR: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    suspended: "bg-gray-100 text-gray-600",
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(["all", "pending", "approved", "rejected", "suspended"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-[13px] font-semibold capitalize transition-all",
              filter === f ? "bg-[#d3a14e] text-white" : "bg-white border border-border/60 text-ink-soft hover:text-ink"
            )}>
            {f} {f !== "all" && `(${salons.filter(s => s.approvalStatus === f).length})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-ink-soft">Loading salons…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8f6f3] border-b border-border/40">
              <tr>
                <th className="px-6 py-4 font-bold text-ink-soft uppercase tracking-wider text-[11px]">Salon</th>
                <th className="px-6 py-4 font-bold text-ink-soft uppercase tracking-wider text-[11px]">Category</th>
                <th className="px-6 py-4 font-bold text-ink-soft uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-6 py-4 font-bold text-ink-soft uppercase tracking-wider text-[11px]">KYC</th>
                <th className="px-6 py-4 font-bold text-ink-soft uppercase tracking-wider text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-ink-softer">No salons found.</td></tr>
              )}
              {filtered.map(salon => (
                <tr key={salon.id} className="hover:bg-[#fdfaf6] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-ink">{salon.name}</div>
                    <div className="text-ink-softer text-[12px] mt-0.5">{salon.address ?? "No address"}</div>
                  </td>
                  <td className="px-6 py-4 text-ink-soft">{salon.category ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold capitalize", STATUS_COLOR[salon.approvalStatus] ?? "bg-gray-100 text-gray-600")}>
                      {salon.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {salon.kycVerified
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <XCircle className="w-4 h-4 text-red-400" />
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {salon.approvalStatus === "pending" && (
                        <>
                          <button onClick={() => approveMutation.mutate(salon.id)}
                            className="px-3 py-1.5 bg-green-50 text-green-700 text-[12px] font-bold rounded-lg hover:bg-green-100 transition-colors">
                            Approve
                          </button>
                          <button onClick={() => setRejectingId(salon.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-700 text-[12px] font-bold rounded-lg hover:bg-red-100 transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      {salon.approvalStatus === "approved" && (
                        <button onClick={() => suspendMutation.mutate(salon.id)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[12px] font-bold rounded-lg hover:bg-gray-200 transition-colors">
                          Suspend
                        </button>
                      )}
                    </div>
                    {/* Reject dialog */}
                    {rejectingId === salon.id && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3 text-left">
                        <input
                          type="text"
                          placeholder="Reason for rejection…"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-red-200 text-[13px] outline-none mb-2"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => rejectMutation.mutate({ salonId: salon.id, reason: rejectReason })}
                            className="px-3 py-1.5 bg-red-600 text-white text-[12px] font-bold rounded-lg">
                            Confirm Reject
                          </button>
                          <button onClick={() => setRejectingId(null)}
                            className="px-3 py-1.5 bg-white text-ink-soft text-[12px] font-bold rounded-lg border border-border">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── User Management Tab ──────────────────────────────────────────────────────

function UserManagementTab({ session }: { session: SessionUser }) {
  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => getAllUsers({ data: { callerRole: session.role } }),
    enabled: session.role === "super_admin",
  });

  const ROLE_COLOR: Record<string, string> = {
    super_admin: "bg-[#d3a14e]/15 text-[#d3a14e]",
    sub_admin: "bg-blue-100 text-blue-700",
    salon_owner: "bg-purple-100 text-purple-700",
    staff: "bg-green-100 text-green-700",
    customer: "bg-gray-100 text-gray-600",
  };

  return (
    <div>
      {session.role !== "super_admin" ? (
        <div className="text-center py-20 text-ink-soft">Sub admins cannot access User Management.</div>
      ) : isLoading ? (
        <div className="h-32 flex items-center justify-center text-ink-soft">Loading users…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-ink">All Users <span className="text-ink-softer font-mono ml-2">({allUsers.length})</span></h2>
          </div>
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8f6f3] border-b border-border/40">
              <tr>
                <th className="px-6 py-4 font-bold text-ink-soft uppercase tracking-wider text-[11px]">User</th>
                <th className="px-6 py-4 font-bold text-ink-soft uppercase tracking-wider text-[11px]">Role</th>
                <th className="px-6 py-4 font-bold text-ink-soft uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-6 py-4 font-bold text-ink-soft uppercase tracking-wider text-[11px]">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {allUsers.map(u => (
                <tr key={u.id} className="hover:bg-[#fdfaf6] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-ink">{u.name ?? u.username}</div>
                    <div className="text-ink-softer text-[12px]">{u.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold", ROLE_COLOR[u.role] ?? "bg-gray-100")}>
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.suspendedAt
                      ? <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[11px] font-bold rounded-full">Suspended</span>
                      : <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-full">Active</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-ink-softer font-mono text-[12px]">
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Access Control Tab ────────────────────────────────────────────────────────

function AccessControlTab({ session }: { session: SessionUser }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [uname, setUname] = useState("");
  const [pw, setPw] = useState("");
  const [cityId, setCityId] = useState("");
  const [msg, setMsg] = useState("");

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: () => getCities(),
  });

  const createMutation = useMutation({
    mutationFn: () => createSubAdmin({
      data: {
        callerRole: session.role,
        username: uname,
        password: pw,
        name,
        cityId: parseInt(cityId),
      }
    }),
    onSuccess: () => {
      setMsg("Sub admin created successfully.");
      setName(""); setUname(""); setPw(""); setCityId("");
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
    },
    onError: (e: any) => setMsg(e.message),
  });

  if (session.role !== "super_admin") {
    return <div className="text-center py-20 text-ink-soft">Only Super Admins can manage access control.</div>;
  }

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-2xl border border-border/40 shadow-sm p-8">
        <h2 className="text-[18px] font-display font-semibold text-ink mb-1">Create Sub Admin</h2>
        <p className="text-[13px] text-ink-soft mb-6">Sub admins manage a single city and cannot access financials, commission settings, or other cities.</p>

        {msg && <div className="mb-5 p-3 rounded-lg bg-primary/10 text-primary text-[13px] font-medium">{msg}</div>}

        <div className="space-y-4">
          <Field label="Full Name" value={name} onChange={setName} placeholder="Ravi Kumar" />
          <Field label="Username" value={uname} onChange={setUname} placeholder="ravi@bbsr" />
          <Field label="Password" value={pw} onChange={setPw} placeholder="••••••••" type="password" />
          <div>
            <label className="block text-[11px] font-bold text-ink-soft uppercase tracking-wider mb-2">City Scope</label>
            <select value={cityId} onChange={e => setCityId(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-white border border-border/80 text-[14px] outline-none">
              <option value="">Select a city…</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}, {c.state}</option>
              ))}
            </select>
          </div>
          <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}
            className="w-full h-12 bg-[#d3a14e] hover:bg-[#c4923e] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Creating…" : "Create Sub Admin"}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-border/40 shadow-sm p-8">
        <h2 className="text-[18px] font-display font-semibold text-ink mb-6">Role Hierarchy</h2>
        <div className="space-y-3">
          {[
            { role: "Super Admin", desc: "Full platform access, financial controls, creates sub admins", color: "bg-[#d3a14e]/15 text-[#d3a14e]" },
            { role: "Sub Admin", desc: "City-scoped: approve salons, resolve disputes, push notifications", color: "bg-blue-100 text-blue-700" },
            { role: "Salon Owner", desc: "Own salon only: queue, staff, services, revenue", color: "bg-purple-100 text-purple-700" },
            { role: "Staff / Barber", desc: "Own schedule & queue management only", color: "bg-green-100 text-green-700" },
            { role: "Customer", desc: "View salons, join queues, review", color: "bg-gray-100 text-gray-600" },
          ].map(item => (
            <div key={item.role} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f8f6f3] transition-colors">
              <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 mt-0.5", item.color)}>{item.role}</span>
              <p className="text-[13px] text-ink-soft">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Live Monitor Tab ─────────────────────────────────────────────────────────

function LiveMonitorTab({ session }: { session: SessionUser }) {
  const { data: salons = [] } = useQuery({
    queryKey: ["salons-live"],
    queryFn: () => getSalons({ data: { callerRole: session.role } }),
    refetchInterval: 10000,
  });

  const activeSalons = salons.filter(s => s.status === "open" && s.approvalStatus === "approved");

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[13px] font-semibold text-ink-soft">{activeSalons.length} salons live right now</span>
      </div>
      {activeSalons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/40 p-20 text-center text-ink-softer">
          No salons are currently live. Approve and activate salons from Salon Management.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeSalons.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-border/40 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-ink">{s.name}</h3>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              </div>
              <p className="text-[12px] text-ink-softer">{s.address ?? "No address"}</p>
              <p className="text-[12px] text-ink-softer mt-1">{s.category ?? "Salon"} · {s.rating ? `${s.rating}★` : "Unrated"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Coming Soon Tab ──────────────────────────────────────────────────────────

function ComingSoonTab({ tab }: { tab: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#d3a14e]/10 flex items-center justify-center mb-4">
        <TrendingUp className="w-8 h-8 text-[#d3a14e]" />
      </div>
      <h2 className="text-[22px] font-display font-semibold text-ink mb-2">{tab}</h2>
      <p className="text-[14px] text-ink-soft max-w-sm">This section is being built and will be available in the next release.</p>
    </div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, accent, green, warn }: {
  icon: any; label: string; value: number | string; accent?: boolean; green?: boolean; warn?: boolean;
}) {
  const color = accent ? "text-[#d3a14e]" : green ? "text-green-600" : warn ? "text-amber-600" : "text-ink";
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

function Field({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-ink-soft uppercase tracking-wider mb-2">{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3.5 rounded-xl bg-white border border-border/80 focus:ring-2 focus:ring-[#d3a14e]/40 focus:border-[#d3a14e] transition-all text-[14px] outline-none" />
    </div>
  );
}
