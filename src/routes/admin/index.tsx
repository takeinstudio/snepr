import { createFileRoute } from "@tanstack/react-router";
import { getSalons, createSalon, updateSalon, deleteSalon } from "../../backend/functions/salons";
import { login } from "../../backend/functions/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LayoutDashboard, Users, MapPin, Search, Settings, LogOut, Bell, ChevronRight, Eye, MoreHorizontal, ArrowRight } from "lucide-react";
import { SneprWordmark } from "@/components/SneprWordmark";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<{ id: number; username: string; role: string } | null>(null);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");

  const { data: salons, isLoading } = useQuery({
    queryKey: ["salons"],
    queryFn: () => getSalons(),
    enabled: !!user,
  });

  const loginMutation = useMutation({
    mutationFn: () => login({ data: { username, password } }),
    onSuccess: (data) => {
      setUser(data);
      setLoginError("");
    },
    onError: () => {
      setLoginError("Invalid credentials");
    }
  });

  if (!user) {
    return (
      <div className="grid lg:grid-cols-[1.1fr_1fr] min-h-screen bg-[#fdfaf6]">
        {/* Left Side Visual */}
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
              Join the most premium network of barbers and salons to craft unforgettable customer experiences.
            </p>
            
            <div className="mt-8 inline-flex items-center gap-4 px-6 py-3 rounded-full border border-[#d3a14e]/40 bg-ink/30 backdrop-blur-md">
              <span className="w-8 h-px bg-[#d3a14e] block"></span>
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#d3a14e] uppercase">SNEPR PREMIUM NETWORK</span>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-[#fdfaf6]">
          <div className="w-full max-w-sm mx-auto">
            <div className="lg:hidden mb-12">
              <SneprWordmark height={28} className="text-ink" />
            </div>

            <h2 className="text-[34px] font-display text-ink mb-2 leading-tight">Welcome Back</h2>
            <p className="text-[15px] text-ink-soft mb-10 font-light">Enter your credentials to access your portal.</p>

            {loginError && (
              <div className="p-3 mb-6 bg-destructive/10 text-destructive text-[13px] font-medium rounded-lg border border-destructive/20">
                {loginError}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-ink-soft uppercase tracking-wider mb-2">Username / Email</label>
                <input
                  type="text"
                  placeholder="hello@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white border border-border/80 focus:ring-2 focus:ring-[#d3a14e]/40 focus:border-[#d3a14e] transition-all text-[15px] shadow-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ink-soft uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white border border-border/80 focus:ring-2 focus:ring-[#d3a14e]/40 focus:border-[#d3a14e] transition-all text-[15px] shadow-sm outline-none font-mono"
                />
              </div>

              <button
                onClick={() => loginMutation.mutate()}
                disabled={loginMutation.isPending}
                className="w-full mt-4 h-[56px] bg-[#d3a14e] hover:bg-[#c4923e] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 press-active shadow-md"
              >
                {loginMutation.isPending ? "SIGNING IN..." : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    SIGN IN
                  </>
                )}
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

  const sidebarLinks = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Snepr Live", icon: Eye },
    { name: "Booking Management", icon: MapPin },
    { name: "Vendor Management", icon: Users },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#fdfaf6] font-sans text-ink overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-[280px] shrink-0 border-r border-border/50 bg-[#fefdfb] flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-20">
        <div className="p-8 pb-8 flex flex-col items-center border-b border-border/20">
          <SneprWordmark height={32} className="text-[#d3a14e] mb-4" />
          <div className="inline-flex px-3.5 py-1.5 bg-[#d3a14e]/10 text-[#d3a14e] text-[10px] font-bold uppercase tracking-widest rounded-full">
            Admin Console
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => setActiveTab(link.name)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[14px] font-medium transition-all",
                activeTab === link.name 
                  ? "bg-[#d3a14e] text-white shadow-md shadow-[#d3a14e]/20"
                  : "text-ink-soft hover:bg-black/[0.03] hover:text-ink"
              )}
            >
              <link.icon className="w-5 h-5" strokeWidth={activeTab === link.name ? 2.5 : 2} />
              {link.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border/40">
          <button 
            onClick={() => setUser(null)}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[14px] font-medium text-ink-soft hover:bg-black/[0.03] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Exit Dashboard
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8f6f3]">
        
        {/* Header */}
        <header className="h-[96px] shrink-0 bg-white border-b border-border/40 flex items-center justify-between px-10 shadow-sm z-10">
          <h1 className="text-[26px] font-display font-medium text-ink">{activeTab}</h1>
          
          <div className="flex items-center gap-8">
            <button className="text-ink-soft hover:text-ink transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft/70">Welcome {user.role}</div>
                <div className="text-[15px] font-semibold text-[#d3a14e] mt-0.5">{user.username}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {user.username[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-10">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Revenue Generated" value="₹0" change="+12.5%" />
            <StatCard title="Total Bookings" value="0" change="+5.2%" />
            <StatCard title="Active Vendors" value={salons?.length || 0} change="+2" />
            <StatCard title="System Alerts" value="1" isAlert />
          </div>

          {/* Main Card (Table) */}
          <div className="bg-white rounded-[24px] shadow-sm border border-border/40 overflow-hidden">
            <div className="p-8 border-b border-border/40 flex items-center justify-between bg-white">
              <h2 className="text-[18px] font-display font-semibold text-ink">Recent Booking Requests</h2>
              <button className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-widest text-[#d3a14e] hover:text-[#c4923e] transition-colors">
                <span className="bg-surface px-2.5 py-1 rounded-full text-ink-soft bg-[#f8f6f3]">0 TOTAL</span>
                VIEW ALL
              </button>
            </div>
            
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <p className="text-[15px] text-ink-soft">
                No new booking requests yet. Test the flow by booking a venue!
              </p>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, change, isAlert = false }: { title: string, value: string | number, change?: string, isAlert?: boolean }) {
  return (
    <div className="bg-white p-7 rounded-[24px] shadow-sm border border-border/40 flex flex-col justify-between h-[140px]">
      <div className="text-[11px] font-bold text-ink-soft/80 uppercase tracking-widest">{title}</div>
      <div className="flex items-baseline gap-3 mt-auto">
        <div className="text-[40px] font-display font-semibold text-ink leading-none">{value}</div>
        {!isAlert && change && (
          <div className="text-[13px] font-bold text-[#34A853]">{change}</div>
        )}
      </div>
    </div>
  );
}
