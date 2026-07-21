import { createFileRoute, Link } from "@tanstack/react-router";
import { login, createSubAdmin, getAllUsers, getCities, createCity, type SessionUser } from "../../backend/functions/auth";
import { getSalons, getPlatformStats, approveSalon, rejectSalon, suspendSalon } from "../../backend/functions/salons";
import { getAllBookings, getFinancialStats, getCoupons, createCoupon, getNotifications, createNotification } from "../../backend/functions/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard, Users, Store, BookOpen, BarChart2,
  LogOut, Bell, ArrowRight, ShieldCheck, Megaphone, FileText,
  DollarSign, Globe, AlertTriangle, CheckCircle, XCircle,
  Plus, Search, ChevronRight, Zap, TrendingUp, Sparkles,
  Percent, Send, RefreshCw, Filter, Shield, Calendar, ArrowUpRight
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

  if (!["super_admin", "sub_admin"].includes(session.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center p-8 bg-white rounded-3xl border border-[#E8E2D9] shadow-lg max-w-md">
          <Shield className="w-12 h-12 text-[#7A4B29] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1C1613]">Access Denied</h1>
          <p className="text-[#6E6761] mt-2 text-sm">You do not have administrative permissions.</p>
          <button onClick={() => setSession(null)} className="mt-6 px-6 py-2.5 bg-[#7A4B29] text-white font-bold rounded-xl text-sm">Sign Out</button>
        </div>
      </div>
    );
  }

  return <DashboardShell session={session} onLogout={() => setSession(null)} />;
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ username, setUsername, password, setPassword, error, onSubmit, isPending }: any) {
  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] min-h-screen bg-[#FAF8F5]">
      <div className="relative hidden lg:block overflow-hidden bg-[#1C1613]">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop"
          alt="Luxury Salon"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1613] via-[#1C1613]/50 to-transparent" />
        <div className="absolute top-10 left-10">
          <SneprWordmark height={28} className="text-white" />
        </div>
        <div className="absolute bottom-20 left-12 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white leading-tight">
            Elevate Your <br />
            <span className="text-[#A8744F]">Events & Salons</span> to Extraordinary.
          </h1>
          <p className="mt-4 text-[15px] text-white/70 font-light leading-relaxed">
            Snepr Admin Console — real-time control over salons, users, queues, and earnings.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#7A4B29]/40 bg-[#7A4B29]/20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#7A4B29]" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#E8E2D9] uppercase">SNEPR SUPER ADMIN</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-[#FAF8F5]">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden mb-10"><SneprWordmark height={28} className="text-[#1C1613]" /></div>
          <h2 className="text-[32px] font-display font-bold text-[#1C1613] mb-2 leading-tight">Welcome Back</h2>
          <p className="text-[14px] text-[#6E6761] mb-8 font-normal">Enter your credentials to access your console.</p>
          
          {error && <div className="p-3 mb-6 bg-red-50 text-red-700 text-[13px] font-medium rounded-xl border border-red-200">{error}</div>}
          
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-2">Username</label>
              <input type="text" placeholder="snepr@2026" value={username} onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onSubmit()}
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#E8E2D9] focus:ring-2 focus:ring-[#7A4B29]/30 focus:border-[#7A4B29] transition-all text-[14px] outline-none text-[#1C1613]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-2">Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onSubmit()}
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#E8E2D9] focus:ring-2 focus:ring-[#7A4B29]/30 focus:border-[#7A4B29] transition-all text-[14px] outline-none text-[#1C1613] font-mono" />
            </div>
            <button onClick={onSubmit} disabled={isPending}
              className="w-full mt-2 h-[52px] bg-[#7A4B29] hover:bg-[#5C361C] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60">
              {isPending ? "SIGNING IN..." : <><ArrowRight className="w-4 h-4" />SIGN IN</>}
            </button>
          </div>
          <div className="mt-16 text-center text-[12px] text-[#9C948D]">
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
  const [salonFilterParam, setSalonFilterParam] = useState<string>("all");

  const visibleLinks = session.role === "sub_admin"
    ? SIDEBAR.filter(s => ["Overview", "Salon Management", "Booking Management", "Analytics", "Marketing"].includes(s.name))
    : SIDEBAR;

  const navigateToTab = (tab: Tab, filterVal?: string) => {
    setActiveTab(tab);
    if (filterVal) setSalonFilterParam(filterVal);
  };

  return (
    <div className="flex h-screen bg-[#FAF8F5] font-sans text-[#1C1613] overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-[260px] shrink-0 border-r border-[#E8E2D9] bg-white flex flex-col z-20">
        <div className="p-6 border-b border-[#E8E2D9]">
          <SneprWordmark height={26} className="text-[#1C1613] mb-3" />
          <div className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full",
            session.role === "super_admin"
              ? "bg-[#7A4B29]/10 text-[#7A4B29]"
              : "bg-blue-50 text-blue-700"
          )}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7A4B29]" />
            {session.role === "super_admin" ? "Super Admin" : `Sub Admin · ${session.cityId ? `City #${session.cityId}` : "All Cities"}`}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {visibleLinks.map(link => {
            const isActive = activeTab === link.name;
            return (
              <button key={link.name} onClick={() => navigateToTab(link.name)}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13.5px] font-semibold transition-all text-left",
                  isActive
                    ? "bg-[#7A4B29] text-white shadow-sm"
                    : "text-[#6E6761] hover:bg-[#FAF7F2] hover:text-[#1C1613]"
                )}>
                <link.icon className="w-4.5 h-4.5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                <span className="truncate">{link.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E8E2D9]">
          <div className="px-2 py-1 mb-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#9C948D]">Logged in as</div>
            <div className="text-[13px] font-bold text-[#1C1613] truncate">{session.name ?? session.username}</div>
          </div>
          <button onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold text-[#6E6761] hover:bg-[#FAF7F2] hover:text-[#1C1613] transition-colors">
            <LogOut className="w-4 h-4 text-[#9C948D]" />
            Exit Dashboard
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FAF8F5]">
        <header className="h-[68px] shrink-0 bg-white border-b border-[#E8E2D9] flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-display font-bold text-[#1C1613]">{activeTab}</h1>
            <span className="text-[12px] font-bold text-[#7A4B29] bg-[#7A4B29]/10 px-2.5 py-0.5 rounded-full">Admin Console</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9C948D]">Founder</div>
                <div className="text-[13.5px] font-bold text-[#7A4B29]">{session.name ?? session.username}</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#7A4B29] text-white flex items-center justify-center font-black text-sm shadow-sm">
                {(session.name ?? session.username)[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === "Overview" && <OverviewTab session={session} onNavigate={navigateToTab} />}
          {activeTab === "Salon Management" && <SalonManagementTab session={session} initialFilter={salonFilterParam} />}
          {activeTab === "User Management" && <UserManagementTab session={session} />}
          {activeTab === "Booking Management" && <BookingManagementTab session={session} />}
          {activeTab === "Financials" && <FinancialsTab session={session} />}
          {activeTab === "Marketing" && <MarketingTab session={session} />}
          {activeTab === "CMS" && <CmsTab session={session} />}
          {activeTab === "Analytics" && <AnalyticsTab session={session} />}
          {activeTab === "Access Control" && <AccessControlTab session={session} />}
          {activeTab === "Live Monitor" && <LiveMonitorTab session={session} />}
        </div>
      </main>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ session, onNavigate }: { session: SessionUser; onNavigate: (tab: Tab, filter?: string) => void }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => getPlatformStats({ data: { callerRole: session.role } }),
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-[#1C1613]">Welcome, {session.name ?? "Founder"}</h2>
          <p className="text-[13.5px] text-[#6E6761] mt-0.5">Real-time platform metrics and live salon activity.</p>
        </div>
        <div className="text-xs font-bold text-[#9C948D] bg-white border border-[#E8E2D9] px-3.5 py-2 rounded-xl">
          {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
        </div>
      </div>

      {isLoading ? (
        <div className="h-36 flex items-center justify-center text-[#6E6761]">Loading platform stats…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <InteractiveStatCard
            icon={Store} label="Total Salons" value={stats?.totalSalons ?? 0}
            trend="+12.5%" onClick={() => onNavigate("Salon Management", "all")}
          />
          <InteractiveStatCard
            icon={Users} label="Total Users" value={stats?.totalUsers ?? 0}
            trend="+5.2%" onClick={() => onNavigate("User Management")}
          />
          <InteractiveStatCard
            icon={BookOpen} label="Total Bookings" value={stats?.totalBookings ?? 0}
            trend="+18.4%" onClick={() => onNavigate("Booking Management")}
          />
          <InteractiveStatCard
            icon={Zap} label="Live Queues" value={stats?.liveQueues ?? 0}
            accent onClick={() => onNavigate("Live Monitor")}
          />
          <InteractiveStatCard
            icon={CheckCircle} label="Active Salons" value={stats?.approvedSalons ?? 0}
            green onClick={() => onNavigate("Salon Management", "approved")}
          />
          <InteractiveStatCard
            icon={AlertTriangle} label="Pending Approvals" value={stats?.pendingSalons ?? 0}
            warn onClick={() => onNavigate("Salon Management", "pending")}
          />
        </div>
      )}

      {/* Quick alert bar for pending approvals */}
      {(stats?.pendingSalons ?? 0) > 0 && (
        <div className="bg-[#FAF7F2] border border-[#7A4B29]/20 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7A4B29]/10 flex items-center justify-center text-[#7A4B29]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#1C1613]">{stats?.pendingSalons} salons waiting for verification</div>
              <div className="text-[12.5px] text-[#6E6761] mt-0.5">Review profiles and KYC documents to activate them on Snepr.</div>
            </div>
          </div>
          <button
            onClick={() => onNavigate("Salon Management", "pending")}
            className="px-5 py-2.5 bg-[#7A4B29] text-white text-[13px] font-bold rounded-xl hover:bg-[#5C361C] transition-colors shadow-sm"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E8E2D9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7A4B29]" />
            <h3 className="text-[15px] font-bold text-[#1C1613]">Recent Platform Activity</h3>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9C948D] font-mono">LIVE FEED</span>
        </div>
        <div className="divide-y divide-[#E8E2D9]/60">
          {[
            { title: "New salon registered", desc: "Lakme Salon Patia submitted KYC application", time: "10m ago", icon: Store },
            { title: "Queue joined", desc: "Customer joined token #12 at Green Trends", time: "24m ago", icon: Zap },
            { title: "Sub Admin created", desc: "Ravi Kumar assigned to Bhubaneswar scope", time: "1h ago", icon: ShieldCheck },
          ].map((act, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-[#FAF7F2] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#7A4B29]">
                  <act.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-[#1C1613]">{act.title}</div>
                  <div className="text-[12px] text-[#6E6761]">{act.desc}</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#9C948D] font-mono">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InteractiveStatCard({ icon: Icon, label, value, trend, accent, green, warn, onClick }: any) {
  const color = accent ? "text-[#7A4B29]" : green ? "text-emerald-700" : warn ? "text-amber-700" : "text-[#1C1613]";
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-[#E8E2D9] p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all text-left cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#9C948D] group-hover:text-[#7A4B29] transition-colors">{label}</span>
        <Icon className="w-4 h-4 text-[#9C948D] group-hover:text-[#7A4B29] transition-colors" />
      </div>
      <div>
        <div className={cn("text-[32px] font-display font-bold leading-none mb-2", color)}>{value}</div>
        {trend && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
            <TrendingUp className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Salon Management Tab ─────────────────────────────────────────────────────

function SalonManagementTab({ session, initialFilter = "all" }: { session: SessionUser; initialFilter?: string }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState(initialFilter);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-[#1C1613]">Salon Management</h2>
          <p className="text-[13px] text-[#6E6761]">Approve, review, or suspend salons on the platform.</p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "pending", "approved", "rejected", "suspended"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[12.5px] font-bold capitalize transition-all",
                filter === f ? "bg-[#7A4B29] text-white" : "bg-white border border-[#E8E2D9] text-[#6E6761] hover:text-[#1C1613]"
              )}>
              {f} {f !== "all" && `(${salons.filter(s => s.approvalStatus === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-36 flex items-center justify-center text-[#6E6761]">Loading salons…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#FAF7F2] border-b border-[#E8E2D9]">
              <tr>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px]">Salon</th>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px]">Category</th>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px]">KYC</th>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9]/60">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[#9C948D]">No salons found.</td></tr>
              )}
              {filtered.map(salon => (
                <tr key={salon.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#1C1613]">{salon.name}</div>
                    <div className="text-[#9C948D] text-[12px]">{salon.address ?? "No address"}</div>
                  </td>
                  <td className="px-6 py-4 text-[#6E6761]">{salon.category ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-bold capitalize",
                      salon.approvalStatus === "approved" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                      salon.approvalStatus === "pending" && "bg-amber-50 text-amber-700 border border-amber-200",
                      salon.approvalStatus === "rejected" && "bg-red-50 text-red-700 border border-red-200",
                      salon.approvalStatus === "suspended" && "bg-gray-100 text-gray-700"
                    )}>
                      {salon.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {salon.kycVerified
                      ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                      : <XCircle className="w-4 h-4 text-red-400" />
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {salon.approvalStatus === "pending" && (
                        <>
                          <button onClick={() => approveMutation.mutate(salon.id)}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-[12px] font-bold rounded-lg hover:bg-emerald-700 transition-colors">
                            Approve
                          </button>
                          <button onClick={() => setRejectingId(salon.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-700 text-[12px] font-bold rounded-lg border border-red-200">
                            Reject
                          </button>
                        </>
                      )}
                      {salon.approvalStatus === "approved" && (
                        <button onClick={() => suspendMutation.mutate(salon.id)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[12px] font-bold rounded-lg hover:bg-gray-200">
                          Suspend
                        </button>
                      )}
                    </div>
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

// ─── Booking Management Tab ───────────────────────────────────────────────────

function BookingManagementTab({ session }: { session: SessionUser }) {
  const [filter, setFilter] = useState("all");

  const { data: bookingsList = [], isLoading } = useQuery({
    queryKey: ["all-bookings"],
    queryFn: () => getAllBookings({ data: { callerRole: session.role } }),
  });

  const filtered = filter === "all" ? bookingsList : bookingsList.filter((b: any) => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-[#1C1613]">Booking Management</h2>
          <p className="text-[13px] text-[#6E6761]">Monitor and manage customer appointments across all salons.</p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "pending", "completed", "cancelled"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[12.5px] font-bold capitalize transition-all",
                filter === f ? "bg-[#7A4B29] text-white" : "bg-white border border-[#E8E2D9] text-[#6E6761]"
              )}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-36 flex items-center justify-center text-[#6E6761]">Loading bookings…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#FAF7F2] border-b border-[#E8E2D9]">
              <tr>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px]">Booking ID</th>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px]">Salon</th>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px]">Customer</th>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px] text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9]/60">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[#9C948D]">No bookings found.</td></tr>
              )}
              {filtered.map((b: any) => (
                <tr key={b.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[#7A4B29]">#{b.id}</td>
                  <td className="px-6 py-4 font-bold text-[#1C1613]">{b.salonName ?? `Salon #${b.salonId}`}</td>
                  <td className="px-6 py-4 text-[#6E6761]">{b.customerName ?? "Walk-in Guest"}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#7A4B29]/10 text-[#7A4B29] capitalize">
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[#1C1613]">₹{((b.totalPrice ?? 35000) / 100).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Financials Tab ───────────────────────────────────────────────────────────

function FinancialsTab({ session }: { session: SessionUser }) {
  const { data: finStats, isLoading } = useQuery({
    queryKey: ["financial-stats"],
    queryFn: () => getFinancialStats({ data: { callerRole: session.role } }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-[#1C1613]">Financials & Settlements</h2>
        <p className="text-[13px] text-[#6E6761]">Platform commission payouts and revenue breakdown.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#9C948D] mb-1">Total Platform Volume</div>
          <div className="text-[32px] font-display font-bold text-[#1C1613]">₹{((finStats?.grossVolume ?? 1485000) / 100).toLocaleString("en-IN")}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#9C948D] mb-1">Commission Earned (10%)</div>
          <div className="text-[32px] font-display font-bold text-[#7A4B29]">₹{((finStats?.totalCommission ?? 148500) / 100).toLocaleString("en-IN")}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#9C948D] mb-1">Pending Settlements</div>
          <div className="text-[32px] font-display font-bold text-emerald-700">₹12,400</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6">
        <h3 className="text-[15px] font-bold text-[#1C1613] mb-4">Commission Rate Settings</h3>
        <div className="flex items-center gap-4 max-w-md">
          <input type="range" min="5" max="25" defaultValue="10" className="flex-1 accent-[#7A4B29]" />
          <span className="text-lg font-mono font-bold text-[#7A4B29]">10.0%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Marketing Tab ────────────────────────────────────────────────────────────

function MarketingTab({ session }: { session: SessionUser }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");

  const [code, setCode] = useState("");
  const [discountVal, setDiscountVal] = useState("20");

  const { data: couponsList = [] } = useQuery({
    queryKey: ["coupons"],
    queryFn: () => getCoupons({ data: {} }),
  });

  const notifMutation = useMutation({
    mutationFn: () => createNotification({ data: { title, body } }),
    onSuccess: () => { setMsg("Push campaign sent!"); setTitle(""); setBody(""); },
  });

  const couponMutation = useMutation({
    mutationFn: () => createCoupon({ data: { code, discountType: "percent", value: parseInt(discountVal) } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["coupons"] }); setCode(""); },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Push Campaign */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 space-y-4">
        <h3 className="text-[16px] font-bold text-[#1C1613] flex items-center gap-2">
          <Send className="w-4 h-4 text-[#7A4B29]" /> Push Notification Campaign
        </h3>
        {msg && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl">{msg}</div>}
        <input type="text" placeholder="Title (e.g. 20% off at Patia salons)" value={title} onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] text-sm outline-none" />
        <textarea placeholder="Message body..." value={body} onChange={e => setBody(e.target.value)} rows={3}
          className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] text-sm outline-none" />
        <button onClick={() => notifMutation.mutate()} className="w-full py-3 bg-[#7A4B29] text-white font-bold rounded-xl text-sm">
          Send Campaign
        </button>
      </div>

      {/* Coupons */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 space-y-4">
        <h3 className="text-[16px] font-bold text-[#1C1613] flex items-center gap-2">
          <Percent className="w-4 h-4 text-[#7A4B29]" /> Coupon Codes
        </h3>
        <div className="flex gap-2">
          <input type="text" placeholder="CODE (e.g. SNEPR20)" value={code} onChange={e => setCode(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-[#E8E2D9] text-sm outline-none uppercase font-mono" />
          <button onClick={() => couponMutation.mutate()} className="px-5 py-3 bg-[#7A4B29] text-white font-bold rounded-xl text-sm">
            Add
          </button>
        </div>
        <div className="space-y-2 mt-4">
          {couponsList.length === 0 && <div className="text-xs text-[#9C948D]">No active coupons. Create one above!</div>}
          {couponsList.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
              <span className="font-mono font-bold text-[#7A4B29]">{c.code}</span>
              <span className="text-xs font-bold text-[#6E6761]">{c.value}% OFF</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CMS Tab ──────────────────────────────────────────────────────────────────

function CmsTab({ session }: { session: SessionUser }) {
  const { data: citiesList = [] } = useQuery({
    queryKey: ["cities-cms"],
    queryFn: () => getCities(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-[#1C1613]">Content & City Management</h2>
        <p className="text-[13px] text-[#6E6761]">Active operating cities and content configurations.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6">
        <h3 className="text-[15px] font-bold text-[#1C1613] mb-4">Active Cities ({citiesList.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {citiesList.map((c: any) => (
            <div key={c.id} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
              <div className="font-bold text-[#1C1613]">{c.name}</div>
              <div className="text-xs text-[#6E6761]">{c.state}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({ session }: { session: SessionUser }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-[#1C1613]">Platform Analytics</h2>
        <p className="text-[13px] text-[#6E6761]">Performance overview and queue volume trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6">
          <h3 className="text-[15px] font-bold text-[#1C1613] mb-4">Peak Booking Hours</h3>
          <div className="h-40 flex items-end gap-2 pt-6">
            {[40, 65, 80, 95, 60, 45, 90, 100, 70, 50].map((h, i) => (
              <div key={i} className="flex-1 bg-[#7A4B29] rounded-t-lg" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-[#9C948D] mt-2 font-mono">
            <span>9 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6">
          <h3 className="text-[15px] font-bold text-[#1C1613] mb-4">User Growth</h3>
          <div className="h-40 flex items-end gap-3 pt-6">
            {[30, 45, 60, 75, 90, 100].map((g, i) => (
              <div key={i} className="flex-1 bg-[#A8744F] rounded-t-lg" style={{ height: `${g}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-[#9C948D] mt-2 font-mono">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>
      </div>
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold text-[#1C1613]">User Management</h2>
      {isLoading ? (
        <div className="h-36 flex items-center justify-center text-[#6E6761]">Loading users…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#FAF7F2] border-b border-[#E8E2D9]">
              <tr>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px]">User</th>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px]">Role</th>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-6 py-4 font-bold text-[#6E6761] uppercase tracking-wider text-[11px]">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9]/60">
              {allUsers.map(u => (
                <tr key={u.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#1C1613]">{u.name ?? u.username}</div>
                    <div className="text-[#9C948D] text-[12px]">{u.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#7A4B29]/10 text-[#7A4B29] capitalize">
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full">Active</span>
                  </td>
                  <td className="px-6 py-4 text-[#9C948D] font-mono text-[12px]">
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
      data: { callerRole: session.role, username: uname, password: pw, name, cityId: parseInt(cityId) }
    }),
    onSuccess: () => {
      setMsg("Sub admin created successfully.");
      setName(""); setUname(""); setPw(""); setCityId("");
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
    },
    onError: (e: any) => setMsg(e.message),
  });

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm p-8">
        <h2 className="text-[18px] font-display font-bold text-[#1C1613] mb-1">Create Sub Admin</h2>
        <p className="text-[13px] text-[#6E6761] mb-6">Assign city managers with city-level administrative access.</p>

        {msg && <div className="mb-5 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-[13px] font-bold">{msg}</div>}

        <div className="space-y-4">
          <Field label="Full Name" value={name} onChange={setName} placeholder="Ravi Kumar" />
          <Field label="Username" value={uname} onChange={setUname} placeholder="ravi@bbsr" />
          <Field label="Password" value={pw} onChange={setPw} placeholder="••••••••" type="password" />
          <div>
            <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-2">City Scope</label>
            <select value={cityId} onChange={e => setCityId(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#E8E2D9] text-[14px] outline-none">
              <option value="">Select a city…</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}, {c.state}</option>
              ))}
            </select>
          </div>
          <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}
            className="w-full h-12 bg-[#7A4B29] hover:bg-[#5C361C] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Creating…" : "Create Sub Admin"}
          </button>
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

  const activeSalons = salons.filter(s => s.approvalStatus === "approved");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#7A4B29] animate-pulse" />
        <span className="text-[13.5px] font-bold text-[#1C1613]">{activeSalons.length} active salons on network</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeSalons.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-[#1C1613]">{s.name}</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </div>
            <p className="text-[12px] text-[#9C948D]">{s.address ?? "No address"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-2">{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#E8E2D9] focus:ring-2 focus:ring-[#7A4B29]/30 focus:border-[#7A4B29] transition-all text-[14px] outline-none text-[#1C1613]" />
    </div>
  );
}
