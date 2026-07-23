import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../backend/functions/auth";
import { sendOtp, registerSalonWithOtp } from "../backend/functions/otp";
import { ArrowRight, Lock, Building2, Mail, Phone, User, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { SneprWordmark } from "@/components/SneprWordmark";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign In & Partner Portal | Snepr" },
      { name: "description", content: "Access your Snepr account or register your salon business." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<"signin" | "signup">("signin");

  // Sign In Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Salon Registration Form State
  const [salonName, setSalonName] = useState("");
  const [category, setCategory] = useState("Unisex Salon");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: () => login({ data: { username, password } }),
    onSuccess: (data) => {
      setLoginError("");
      // Redirect based on role
      if (["super_admin", "sub_admin"].includes(data.role)) {
        navigate({ to: "/salon" });
      } else if (["salon_owner", "staff"].includes(data.role)) {
        navigate({ to: "/salon" });
      } else {
        navigate({ to: "/live" });
      }
    },
    onError: (err: any) => setLoginError(err.message || "Invalid credentials"),
  });

  // Send OTP Mutation
  const sendOtpMutation = useMutation({
    mutationFn: () => sendOtp({ data: { email } }),
    onSuccess: (res) => {
      setOtpSent(true);
      setOtpMessage(res.message);
      setRegError("");
    },
    onError: (err: any) => setRegError(err.message || "Failed to send verification code."),
  });

  // Register Salon Mutation
  const registerMutation = useMutation({
    mutationFn: () =>
      registerSalonWithOtp({
        data: {
          name: salonName,
          category,
          address,
          phone,
          email,
          ownerName,
          password: regPassword,
          otpCode,
        },
      }),
    onSuccess: (res) => {
      setRegSuccess(res.message);
      setRegError("");
      setTimeout(() => {
        navigate({ to: "/salon" });
      }, 1500);
    },
    onError: (err: any) => setRegError(err.message || "Registration failed."),
  });

  return (
    <div className="min-h-screen bg-[#141210] text-[#F3EFEA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <SneprWordmark height={34} className="text-[#D4A373] mx-auto mb-6" />
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Welcome to Snepr Platform
        </h2>
        <p className="mt-1 text-xs text-[#A69F96]">
          Sign in to your account or register your salon business.
        </p>

        {/* Mode Selector Switcher */}
        <div className="mt-6 p-1 bg-[#1A1714] rounded-2xl border border-[#2D2824] flex items-center gap-1">
          <button
            onClick={() => setActiveMode("signin")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeMode === "signin"
                ? "bg-[#7A4B29] text-white shadow"
                : "text-[#8E867E] hover:text-white"
            )}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveMode("signup")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
              activeMode === "signup"
                ? "bg-[#7A4B29] text-white shadow"
                : "text-[#8E867E] hover:text-white"
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            Register Salon
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1A1714] border border-[#2D2824] py-8 px-6 shadow-2xl rounded-2xl sm:px-8">
          {/* ─── MODE 1: SIGN IN ─── */}
          {activeMode === "signin" && (
            <div className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#A69F96] uppercase tracking-wider mb-1.5">
                  Username or Email
                </label>
                <input
                  type="text"
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loginMutation.mutate()}
                  className="w-full px-4 py-3 bg-[#141210] border border-[#2D2824] rounded-xl text-white text-xs outline-none focus:border-[#7A4B29]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#A69F96] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loginMutation.mutate()}
                  className="w-full px-4 py-3 bg-[#141210] border border-[#2D2824] rounded-xl text-white text-xs outline-none focus:border-[#7A4B29] font-mono"
                />
              </div>

              <button
                onClick={() => loginMutation.mutate()}
                disabled={loginMutation.isPending}
                className="w-full h-12 bg-[#7A4B29] hover:bg-[#8F5A33] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow"
              >
                <ArrowRight className="w-4 h-4" />
                {loginMutation.isPending ? "Authenticating…" : "Sign In"}
              </button>
            </div>
          )}

          {/* ─── MODE 2: REGISTER SALON WITH EMAIL OTP ─── */}
          {activeMode === "signup" && (
            <div className="space-y-4">
              {regError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  {regError}
                </div>
              )}
              {regSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  {regSuccess}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#A69F96] uppercase tracking-wider mb-1">
                  Salon Business Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jawed Habib Salon"
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white text-xs outline-none focus:border-[#7A4B29]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#A69F96] uppercase tracking-wider mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    placeholder="Owner Full Name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white text-xs outline-none focus:border-[#7A4B29]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#A69F96] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white text-xs outline-none focus:border-[#7A4B29]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#A69F96] uppercase tracking-wider mb-1">
                  Address & Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plot 14, Patia, Bhubaneswar"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white text-xs outline-none focus:border-[#7A4B29]"
                />
              </div>

              {/* Email & OTP Trigger */}
              <div>
                <label className="block text-[11px] font-bold text-[#A69F96] uppercase tracking-wider mb-1">
                  Owner Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="owner@snepr.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white text-xs outline-none focus:border-[#7A4B29]"
                  />
                  <button
                    onClick={() => sendOtpMutation.mutate()}
                    disabled={!email || sendOtpMutation.isPending}
                    className="px-3.5 py-2.5 bg-[#D4A373] hover:bg-[#c39262] text-[#141210] font-bold text-xs rounded-xl shrink-0 disabled:opacity-50"
                  >
                    {sendOtpMutation.isPending ? "Sending…" : otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                </div>
                {otpMessage && <p className="text-[10px] text-emerald-400 mt-1 font-semibold">{otpMessage}</p>}
              </div>

              {/* OTP Code Input */}
              {otpSent && (
                <div>
                  <label className="block text-[11px] font-bold text-[#D4A373] uppercase tracking-wider mb-1">
                    Enter 6-Digit Email OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#25211D] border border-[#D4A373]/40 rounded-xl text-white text-center tracking-widest font-mono text-base font-bold outline-none focus:border-[#D4A373]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#A69F96] uppercase tracking-wider mb-1">
                  Create Account Password
                </label>
                <input
                  type="password"
                  placeholder="Set strong password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white text-xs outline-none focus:border-[#7A4B29] font-mono"
                />
              </div>

              <button
                onClick={() => registerMutation.mutate()}
                disabled={!otpCode || !regPassword || registerMutation.isPending}
                className="w-full h-12 bg-[#7A4B29] hover:bg-[#8F5A33] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow"
              >
                <ShieldCheck className="w-4 h-4" />
                {registerMutation.isPending ? "Submitting Registration…" : "Verify OTP & Register Salon"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
