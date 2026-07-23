import React, { useState } from "react";
import {
  LayoutDashboard, Zap, BookOpen, Scissors, Users, Calendar as CalendarIcon,
  UserCheck, Star, Building2, Tag, DollarSign, BarChart3, Bell, Package,
  CreditCard, ShieldCheck, GitBranch, Share2, FileText, Settings, Plus,
  CheckCircle2, Clock, Play, Pause, UserPlus, Search, Filter, Download,
  TrendingUp, Award, MapPin, Phone, Mail, Sparkles, Check, X, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SalonOSTab =
  | "Dashboard"
  | "Appointments"
  | "Live Queue"
  | "Services"
  | "Staff"
  | "Calendar"
  | "Customer CRM"
  | "Reviews"
  | "Business Profile"
  | "Offers & Promo"
  | "Revenue & Finance"
  | "Analytics"
  | "Notifications"
  | "Inventory"
  | "Payroll"
  | "Subscriptions"
  | "Multi-Branch"
  | "Marketing Tools"
  | "Reports"
  | "Settings";

export const SALON_OS_NAV: { name: SalonOSTab; icon: any; category: string; isExclusive?: boolean }[] = [
  { name: "Dashboard", icon: LayoutDashboard, category: "Core" },
  { name: "Live Queue", icon: Zap, category: "Core", isExclusive: true },
  { name: "Appointments", icon: BookOpen, category: "Core" },
  { name: "Calendar", icon: CalendarIcon, category: "Core" },
  { name: "Services", icon: Scissors, category: "Management" },
  { name: "Staff", icon: Users, category: "Management" },
  { name: "Customer CRM", icon: UserCheck, category: "Management" },
  { name: "Reviews", icon: Star, category: "Management" },
  { name: "Business Profile", icon: Building2, category: "Setup" },
  { name: "Offers & Promo", icon: Tag, category: "Growth" },
  { name: "Revenue & Finance", icon: DollarSign, category: "Finance" },
  { name: "Analytics", icon: BarChart3, category: "Finance" },
  { name: "Inventory", icon: Package, category: "Operations" },
  { name: "Payroll", icon: CreditCard, category: "Operations" },
  { name: "Subscriptions", icon: ShieldCheck, category: "Setup" },
  { name: "Multi-Branch", icon: GitBranch, category: "Growth" },
  { name: "Marketing Tools", icon: Share2, category: "Growth" },
  { name: "Reports", icon: FileText, category: "Operations" },
];

export function SalonOSPortal({ session, onLogout }: { session: any; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<SalonOSTab>("Dashboard");

  // Check approval status (pending | rejected | approved)
  const approvalStatus = session?.approvalStatus || "approved";

  if (approvalStatus === "pending") {
    return (
      <div className="min-h-screen bg-[#141210] text-[#F3EFEA] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-[#1A1714] border border-[#7A4B29]/40 p-8 rounded-2xl space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#7A4B29]/20 border border-[#7A4B29]/50 flex items-center justify-center text-[#D4A373] mx-auto text-3xl">
            ⏳
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Salon Verification Pending</h2>
            <p className="text-xs text-[#A69F96] leading-relaxed">
              Your salon registration/claim request has been received! Our Snepr Admin team is reviewing your business details and verification proof.
            </p>
          </div>

          <div className="p-4 bg-[#141210] border border-[#2D2824] rounded-xl text-left text-xs space-y-1.5">
            <p className="text-[#D4A373] font-bold">Status: Pending Verification</p>
            <p className="text-[#8E867E]">Once approved, your full SalonOS dashboard features will be unlocked automatically.</p>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-3 bg-[#25211D] border border-[#3D352E] hover:bg-[#322A25] text-white font-bold text-xs rounded-xl transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (approvalStatus === "rejected") {
    return (
      <div className="min-h-screen bg-[#141210] text-[#F3EFEA] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-[#1A1714] border border-red-500/40 p-8 rounded-2xl space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto text-3xl">
            🚫
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Rejected</h2>
            <p className="text-xs text-[#A69F96] leading-relaxed">
              Your salon registration or claim request was reviewed and could not be verified by Snepr Admin.
            </p>
          </div>

          {session?.rejectionReason && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left text-xs text-red-400 space-y-1">
              <p className="font-bold uppercase tracking-wider text-[10px]">Rejection Reason:</p>
              <p>{session.rejectionReason}</p>
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onLogout}
              className="flex-1 py-3 bg-[#25211D] border border-[#3D352E] hover:bg-[#322A25] text-white font-bold text-xs rounded-xl transition-all"
            >
              Sign Out
            </button>
            <a
              href="mailto:support@snepr.in"
              className="flex-1 py-3 bg-[#7A4B29] hover:bg-[#8F5A33] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [walkinModal, setWalkinModal] = useState(false);
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinService, setWalkinService] = useState("Haircut ₹250");
  const [queueTokens, setQueueTokens] = useState([
    { id: 1, token: 101, name: "Aarav Sharma", service: "Haircut + Beard", waitMins: 5, status: "in-progress", type: "Online" },
    { id: 2, token: 102, name: "Vikram Malhotra", service: "Hair Spa", waitMins: 20, status: "waiting", type: "Walk-in" },
    { id: 3, token: 103, name: "Rohan Gupta", service: "Haircut", waitMins: 35, status: "waiting", type: "Walk-in" },
    { id: 4, token: 104, name: "Priya Patel", service: "Hair Styling", waitMins: 50, status: "waiting", type: "Online" },
  ]);

  const handleAddWalkin = () => {
    if (!walkinName) return;
    const newToken = Math.max(...queueTokens.map((t) => t.token), 100) + 1;
    setQueueTokens([
      ...queueTokens,
      {
        id: Date.now(),
        token: newToken,
        name: walkinName,
        service: walkinService,
        waitMins: queueTokens.filter((q) => q.status === "waiting").length * 15 + 10,
        status: "waiting",
        type: "Walk-in",
      },
    ]);
    setWalkinName("");
    setWalkinPhone("");
    setWalkinModal(false);
  };

  const handleCallNext = () => {
    const waitingList = queueTokens.filter((q) => q.status === "waiting");
    if (!waitingList.length) return;
    const nextId = waitingList[0].id;
    setQueueTokens(
      queueTokens.map((q) => (q.id === nextId ? { ...q, status: "in-progress" } : q))
    );
  };

  return (
    <div className="flex h-screen bg-[#141210] text-[#F3EFEA] font-sans overflow-hidden">
      {/* ─── SIDEBAR ─── */}
      <aside className="w-[280px] shrink-0 border-r border-[#2D2824] bg-[#1A1714] flex flex-col z-20">
        <div className="p-5 border-b border-[#2D2824]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7A4B29] to-[#D4A373] flex items-center justify-center font-bold text-white shadow-lg">
              S
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Snepr <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#7A4B29]/30 text-[#D4A373] border border-[#7A4B29]/40">SalonOS</span>
              </h1>
              <p className="text-[11px] text-[#A69F96]">Owner: {session?.username || "Admin"}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Tickers */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
          {SALON_OS_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-[#7A4B29] text-white shadow-md shadow-[#7A4B29]/20"
                    : "text-[#A69F96] hover:bg-[#25211D] hover:text-white"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-[#8E867E] group-hover:text-[#D4A373]")} />
                  <span>{item.name}</span>
                </div>
                {item.isExclusive && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#D4A373]/20 text-[#D4A373] border border-[#D4A373]/30">
                    USP
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom User Info & Logout */}
        <div className="p-3 border-t border-[#2D2824] bg-[#141210]">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-[#E56B6F] hover:bg-[#E56B6F]/10 rounded-xl transition-colors"
          >
            Sign Out SalonOS
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#141210] overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 border-b border-[#2D2824] bg-[#1A1714] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold tracking-tight text-white">{activeTab}</h2>
            <span className="text-xs text-[#8E867E]">• Snepr Operating System v2.4</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Live Queue Pause Switch */}
            <button
              onClick={() => setIsQueuePaused(!isQueuePaused)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                isQueuePaused
                  ? "bg-[#E56B6F]/20 text-[#E56B6F] border-[#E56B6F]/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              )}
            >
              {isQueuePaused ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isQueuePaused ? "Queue Paused" : "Live Queue Open"}
            </button>

            {/* Quick Add Walk-in */}
            <button
              onClick={() => setWalkinModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7A4B29] hover:bg-[#8F5A33] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Walk-in
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DASHBOARD (HOME) */}
          {activeTab === "Dashboard" && (
            <div className="space-y-6">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="bg-[#1A1714] border border-[#2D2824] p-4 rounded-2xl">
                  <p className="text-[11px] font-bold uppercase text-[#8E867E]">Today's Revenue</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">₹12,450</p>
                  <span className="text-[10px] text-emerald-500/80">↑ +14% vs yesterday</span>
                </div>
                <div className="bg-[#1A1714] border border-[#2D2824] p-4 rounded-2xl">
                  <p className="text-[11px] font-bold uppercase text-[#8E867E]">Live Queue Waiting</p>
                  <p className="text-2xl font-bold text-[#D4A373] mt-1">{queueTokens.filter(q => q.status === "waiting").length} Tokens</p>
                  <span className="text-[10px] text-[#A69F96]">Est. Wait: ~25 mins</span>
                </div>
                <div className="bg-[#1A1714] border border-[#2D2824] p-4 rounded-2xl">
                  <p className="text-[11px] font-bold uppercase text-[#8E867E]">Today's Bookings</p>
                  <p className="text-2xl font-bold text-white mt-1">18</p>
                  <span className="text-[10px] text-emerald-400">14 Completed</span>
                </div>
                <div className="bg-[#1A1714] border border-[#2D2824] p-4 rounded-2xl">
                  <p className="text-[11px] font-bold uppercase text-[#8E867E]">Avg Rating</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1">
                    4.9 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </p>
                  <span className="text-[10px] text-[#A69F96]">Based on 142 reviews</span>
                </div>
                <div className="bg-[#1A1714] border border-[#2D2824] p-4 rounded-2xl">
                  <p className="text-[11px] font-bold uppercase text-[#8E867E]">Peak Hours</p>
                  <p className="text-lg font-bold text-white mt-1">4 PM - 8 PM</p>
                  <span className="text-[10px] text-[#D4A373]">Optimized Staffing</span>
                </div>
              </div>

              {/* Snepr Exclusive Live Queue Ticker Banner */}
              <div className="bg-gradient-to-r from-[#2A1D15] via-[#1A1714] to-[#1A1714] border border-[#7A4B29]/40 p-5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#7A4B29] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#7A4B29]/30">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      Snepr Smart Live Queue Engine Active
                      <span className="text-[10px] bg-[#D4A373]/20 text-[#D4A373] px-2 py-0.5 rounded-full border border-[#D4A373]/30">
                        AI Wait-Time Match
                      </span>
                    </h3>
                    <p className="text-xs text-[#A69F96] mt-0.5">
                      Walk-in + Online Queue integrated seamlessly. Dynamic updates auto-sent to customer mobile devices.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCallNext}
                  className="px-5 py-2.5 bg-[#D4A373] hover:bg-[#c39262] text-[#141210] font-bold text-xs rounded-xl transition-all shadow-md"
                >
                  Call Next Customer Token
                </button>
              </div>

              {/* Queue & Appointments split */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Active Queue List */}
                <div className="bg-[#1A1714] border border-[#2D2824] p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#2D2824] pb-3">
                    <h4 className="font-bold text-white text-sm">Active Live Queue</h4>
                    <span className="text-xs text-[#D4A373] font-semibold">{queueTokens.length} Total Tokens</span>
                  </div>
                  <div className="space-y-2">
                    {queueTokens.map((q) => (
                      <div
                        key={q.id}
                        className={cn(
                          "flex items-center justify-between p-3.5 rounded-xl border text-xs transition-all",
                          q.status === "in-progress"
                            ? "bg-[#7A4B29]/20 border-[#7A4B29]/50 text-white"
                            : "bg-[#141210] border-[#2D2824] text-[#A69F96]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#25211D] border border-[#3D352E] flex items-center justify-center font-bold text-white text-sm">
                            #{q.token}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{q.name}</p>
                            <p className="text-[11px] text-[#8E867E]">{q.service} • {q.type}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={cn(
                              "inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1",
                              q.status === "in-progress"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            )}
                          >
                            {q.status === "in-progress" ? "In Chair" : `Wait ~${q.waitMins}m`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="bg-[#1A1714] border border-[#2D2824] p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#2D2824] pb-3">
                    <h4 className="font-bold text-white text-sm">Upcoming Today's Bookings</h4>
                    <button onClick={() => setActiveTab("Appointments")} className="text-xs text-[#D4A373] hover:underline font-semibold">
                      View All
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-[#141210] border border-[#2D2824] rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">1:30 PM • Kabir Mehta</p>
                        <p className="text-[#8E867E]">Hair Spa + Beard Trim (60 mins)</p>
                      </div>
                      <span className="px-2.5 py-1 bg-[#7A4B29]/20 text-[#D4A373] font-bold rounded-lg border border-[#7A4B29]/30">
                        Confirmed
                      </span>
                    </div>
                    <div className="p-3 bg-[#141210] border border-[#2D2824] rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">2:45 PM • Sanya Verma</p>
                        <p className="text-[#8E867E]">Hair Color & Wash (90 mins)</p>
                      </div>
                      <span className="px-2.5 py-1 bg-[#7A4B29]/20 text-[#D4A373] font-bold rounded-lg border border-[#7A4B29]/30">
                        Confirmed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE QUEUE MANAGEMENT ⭐ */}
          {activeTab === "Live Queue" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-[#1A1714] border border-[#2D2824] p-4 rounded-2xl">
                <div>
                  <h3 className="font-bold text-white text-base">Live Queue Command Center</h3>
                  <p className="text-xs text-[#8E867E]">Real-time token management, wait times, and walk-in integration.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleCallNext} className="px-4 py-2 bg-[#7A4B29] text-white text-xs font-bold rounded-xl shadow">
                    Call Next Token
                  </button>
                  <button onClick={() => setWalkinModal(true)} className="px-4 py-2 bg-[#D4A373] text-[#141210] text-xs font-bold rounded-xl shadow">
                    + Add Walk-In
                  </button>
                </div>
              </div>

              {/* Kanban Token Columns */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Column 1: Waiting */}
                <div className="bg-[#1A1714] border border-[#2D2824] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2D2824]">
                    <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Waiting Queue ({queueTokens.filter(q => q.status === "waiting").length})</h4>
                  </div>
                  {queueTokens.filter(q => q.status === "waiting").map((q) => (
                    <div key={q.id} className="p-3.5 bg-[#141210] border border-[#2D2824] rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white bg-[#25211D] px-2 py-0.5 rounded border border-[#3D352E]">#{q.token}</span>
                        <span className="text-[10px] text-[#A69F96]">Wait: {q.waitMins}m</span>
                      </div>
                      <p className="font-bold text-white">{q.name}</p>
                      <p className="text-[11px] text-[#8E867E]">{q.service}</p>
                    </div>
                  ))}
                </div>

                {/* Column 2: In Service / Chair */}
                <div className="bg-[#1A1714] border border-[#2D2824] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2D2824]">
                    <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">In Service ({queueTokens.filter(q => q.status === "in-progress").length})</h4>
                  </div>
                  {queueTokens.filter(q => q.status === "in-progress").map((q) => (
                    <div key={q.id} className="p-3.5 bg-[#7A4B29]/15 border border-[#7A4B29]/40 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white bg-[#7A4B29] px-2 py-0.5 rounded">#{q.token}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Active in Chair</span>
                      </div>
                      <p className="font-bold text-white">{q.name}</p>
                      <p className="text-[11px] text-[#8E867E]">{q.service}</p>
                    </div>
                  ))}
                </div>

                {/* Column 3: Completed Today */}
                <div className="bg-[#1A1714] border border-[#2D2824] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2D2824]">
                    <h4 className="font-bold text-blue-400 text-xs uppercase tracking-wider">Completed Today (14)</h4>
                  </div>
                  <div className="p-3.5 bg-[#141210] border border-[#2D2824] rounded-xl text-xs opacity-70">
                    <p className="font-bold text-white">#98 • Rajesh Kumar</p>
                    <p className="text-[11px] text-[#8E867E]">Haircut & Beard • Completed at 11:45 AM</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTHER MODULES PLACEHOLDERS / MODULE CONTENT */}
          {["Services", "Staff", "Calendar", "Customer CRM", "Reviews", "Inventory", "Payroll", "Revenue & Finance", "Analytics", "Settings", "Appointments", "Business Profile", "Offers & Promo", "Subscriptions", "Multi-Branch", "Marketing Tools", "Reports", "Notifications"].includes(activeTab) && (
            <div className="bg-[#1A1714] border border-[#2D2824] p-8 rounded-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#7A4B29]/20 border border-[#7A4B29]/40 flex items-center justify-center text-[#D4A373] mx-auto text-2xl">
                ⚙️
              </div>
              <h3 className="text-xl font-bold text-white">{activeTab} Module Active</h3>
              <p className="text-sm text-[#A69F96] max-w-md mx-auto">
                Snepr SalonOS {activeTab} engine loaded with full real-time database synchronization and reporting capabilities.
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button className="px-4 py-2 bg-[#7A4B29] text-white font-bold text-xs rounded-xl">
                  Configure {activeTab} Settings
                </button>
                <button className="px-4 py-2 bg-[#25211D] border border-[#3D352E] text-[#D4A373] font-bold text-xs rounded-xl">
                  Export Data Report
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── ADD WALK-IN MODAL ─── */}
      {walkinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1714] border border-[#2D2824] p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2824] pb-3">
              <h3 className="font-bold text-white text-base">Add Walk-In Customer</h3>
              <button onClick={() => setWalkinModal(false)} className="text-[#8E867E] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A69F96] font-bold mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white outline-none focus:border-[#7A4B29]"
                />
              </div>

              <div>
                <label className="block text-[#A69F96] font-bold mb-1">Phone Number (Optional for SMS token link)</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white outline-none focus:border-[#7A4B29]"
                />
              </div>

              <div>
                <label className="block text-[#A69F96] font-bold mb-1">Select Service</label>
                <select
                  value={walkinService}
                  onChange={(e) => setWalkinService(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white outline-none focus:border-[#7A4B29]"
                >
                  <option value="Haircut ₹250 (30 mins)">Haircut ₹250 (30 mins)</option>
                  <option value="Beard Trim ₹150 (15 mins)">Beard Trim ₹150 (15 mins)</option>
                  <option value="Hair Spa ₹799 (60 mins)">Hair Spa ₹799 (60 mins)</option>
                  <option value="Facial & Grooming ₹1200">Facial & Grooming ₹1200</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button onClick={() => setWalkinModal(false)} className="px-4 py-2 text-xs font-bold text-[#A69F96] hover:bg-[#25211D] rounded-xl">
                Cancel
              </button>
              <button onClick={handleAddWalkin} className="px-5 py-2 bg-[#7A4B29] hover:bg-[#8F5A33] text-white text-xs font-bold rounded-xl shadow">
                Generate Token & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
