import { createFileRoute } from "@tanstack/react-router";
import { login, type SessionUser } from "../../backend/functions/auth";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { SneprWordmark } from "@/components/SneprWordmark";
import { SalonOSPortal } from "@/components/salon/SalonOSPortal";

export const Route = createFileRoute("/salon/")({
  component: SalonDashboard,
});

function SalonDashboard() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => login({ data: { username, password } }),
    onSuccess: (data) => {
      setSession(data);
      setLoginError("");
    },
    onError: () => setLoginError("Invalid credentials"),
  });

  if (!session)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141210] text-[#F3EFEA] px-4">
        <div className="w-full max-w-sm">
          <SneprWordmark height={32} className="text-[#D4A373] mb-8 mx-auto" />
          <h2 className="text-[28px] font-bold text-white mb-2">SalonOS Partner Login</h2>
          <p className="text-[#A69F96] text-[13px] mb-6">
            Access your salon operating system dashboard & live queue controller.
          </p>
          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-400 text-[13px] rounded-xl border border-red-500/20">
              {loginError}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#A69F96] uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loginMutation.mutate()}
                className="w-full px-4 py-3.5 rounded-xl bg-[#1A1714] border border-[#2D2824] focus:border-[#7A4B29] text-[14px] text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#A69F96] uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loginMutation.mutate()}
                className="w-full px-4 py-3.5 rounded-xl bg-[#1A1714] border border-[#2D2824] focus:border-[#7A4B29] text-[14px] text-white outline-none font-mono"
              />
            </div>
            <button
              onClick={() => loginMutation.mutate()}
              disabled={loginMutation.isPending}
              className="w-full h-12 bg-[#7A4B29] hover:bg-[#8F5A33] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-md"
            >
              <ArrowRight className="w-4 h-4" />
              {loginMutation.isPending ? "Signing in…" : "Sign In to SalonOS"}
            </button>
          </div>
          <p className="mt-8 text-center text-[12px] text-[#8E867E]">
            © {new Date().getFullYear()} Snepr Technologies • SalonOS
          </p>
        </div>
      </div>
    );

  if (!["super_admin", "sub_admin", "salon_owner", "staff"].includes(session.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141210] text-[#A69F96]">
        <p>Access denied to SalonOS.</p>
      </div>
    );
  }

  return <SalonOSPortal session={session} onLogout={() => setSession(null)} />;
}
