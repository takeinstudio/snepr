import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../backend/functions/auth";
import { sendOtp, registerSalonWithOtp } from "../backend/functions/otp";
import { ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle2, Building2 } from "lucide-react";
import { SneprWordmark } from "@/components/SneprWordmark";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Welcome Back | Snepr" },
      { name: "description", content: "Enter your credentials to access your portal or register your salon business." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);

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
      if (["super_admin", "sub_admin"].includes(data.role)) {
        navigate({ to: "/salon" });
      } else if (["salon_owner", "staff"].includes(data.role)) {
        navigate({ to: "/salon" });
      } else {
        navigate({ to: "/live" });
      }
    },
    onError: (err: any) => setLoginError(err.message || "Invalid username or password"),
  });

  // Send OTP Mutation
  const sendOtpMutation = useMutation({
    mutationFn: () => sendOtp({ data: { email } }),
    onSuccess: (res: any) => {
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
    onSuccess: (res: any) => {
      setRegSuccess(res.message);
      setRegError("");
      setTimeout(() => {
        navigate({ to: "/salon" });
      }, 1500);
    },
    onError: (err: any) => setRegError(err.message || "Registration failed."),
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-sans bg-[#FDFBF7]">
      {/* ─── LEFT COLUMN: LUXURY DARK HERO PANEL ─── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#141210] overflow-hidden text-white border-r border-[#2D2824]">
        {/* Background Image with Dark Vignette Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-10000 hover:scale-100"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/60 to-transparent" />

        {/* Top Logo */}
        <div className="relative z-10">
          <SneprWordmark height={36} className="text-[#FAF8F5]" />
        </div>

        {/* Hero Tagline */}
        <div className="relative z-10 max-w-lg my-auto space-y-6">
          <h1 className="text-4xl xl:text-5xl font-serif leading-tight text-[#FAF8F5] tracking-tight">
            Elevate Your <span className="text-[#D4A373] italic font-normal">Salon</span> to the Extraordinary.
          </h1>
          <p className="text-sm text-[#A69F96] leading-relaxed font-light">
            Join the most premium network of salons, stylists, and clients with real-time live queues and effortless appointment booking.
          </p>

          <div className="pt-4">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#D4A373]/40 bg-[#D4A373]/10 text-[11px] font-mono font-bold tracking-widest text-[#D4A373] uppercase">
              — SNEPR NAHI KIYA TO KYA KIYA?
            </div>
          </div>
        </div>

        {/* Left Footer info */}
        <div className="relative z-10 text-[11px] text-[#8E867E]">
          © {new Date().getFullYear()} Snepr Technologies • Salon Operating System
        </div>
      </div>

      {/* ─── RIGHT COLUMN: WARM CREAM FORM PANEL ─── */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-[#FDFBF7] relative min-h-screen">
        {/* Top Right Back Link */}
        <div className="flex justify-end mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E5E0D8] bg-white text-[11px] font-bold text-[#6E6761] uppercase tracking-wider hover:bg-[#FAF7F2] hover:text-[#1C1613] transition-all shadow-xs"
          >
            ← Back to Website
          </Link>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto space-y-8">
          {/* Header */}
          <div className="text-left space-y-2">
            <h2 className="text-3xl sm:text-4xl font-serif text-[#1C1613] tracking-tight">
              {activeMode === "signin" ? "Welcome Back" : "Register Your Salon"}
            </h2>
            <p className="text-xs text-[#6E6761]">
              {activeMode === "signin"
                ? "Enter your credentials to access your portal."
                : "Fill in your salon details and verify via Email OTP."}
            </p>
          </div>

          {/* MODE 1: SIGN IN */}
          {activeMode === "signin" && (
            <div className="space-y-5">
              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-2">
                  Email Address or Username
                </label>
                <input
                  type="text"
                  placeholder="hello@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loginMutation.mutate()}
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#E5E0D8] text-[#1C1613] text-sm outline-none focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 shadow-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loginMutation.mutate()}
                    className="w-full px-4 py-3.5 pr-11 rounded-xl bg-white border border-[#E5E0D8] text-[#1C1613] text-sm outline-none focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 shadow-xs font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9C948D] hover:text-[#1C1613]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => loginMutation.mutate()}
                disabled={loginMutation.isPending}
                className="w-full h-13 bg-[#C59B27] hover:bg-[#B38B21] text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-md shadow-[#C59B27]/20"
              >
                <ArrowRight className="w-4 h-4" />
                {loginMutation.isPending ? "SIGNING IN…" : "SIGN IN"}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-[#6E6761]">
                  New to Snepr?{" "}
                  <button
                    onClick={() => setActiveMode("signup")}
                    className="font-bold text-[#C59B27] hover:underline"
                  >
                    Register as Salon Partner
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* MODE 2: REGISTER SALON */}
          {activeMode === "signup" && (
            <div className="space-y-4">
              {regError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-semibold">
                  {regError}
                </div>
              )}
              {regSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold">
                  {regSuccess}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-1.5">
                  Salon Business Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jawed Habib Salon"
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E0D8] text-[#1C1613] text-xs outline-none focus:border-[#D4A373] shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-1.5">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    placeholder="Owner Full Name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E0D8] text-[#1C1613] text-xs outline-none focus:border-[#D4A373] shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E0D8] text-[#1C1613] text-xs outline-none focus:border-[#D4A373] shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-1.5">
                  Address & Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Patia, Bhubaneswar"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E0D8] text-[#1C1613] text-xs outline-none focus:border-[#D4A373] shadow-xs"
                />
              </div>

              {/* Email & OTP Verification */}
              <div>
                <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-1.5">
                  Owner Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="owner@snepr.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#E5E0D8] text-[#1C1613] text-xs outline-none focus:border-[#D4A373] shadow-xs"
                  />
                  <button
                    onClick={() => sendOtpMutation.mutate()}
                    disabled={!email || sendOtpMutation.isPending}
                    className="px-4 py-3 bg-[#C59B27] hover:bg-[#B38B21] text-white font-bold text-xs uppercase tracking-wider rounded-xl shrink-0 shadow-xs disabled:opacity-50"
                  >
                    {sendOtpMutation.isPending ? "Sending…" : otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                </div>
                {otpMessage && <p className="text-[11px] text-emerald-700 mt-1 font-semibold">{otpMessage}</p>}
              </div>

              {otpSent && (
                <div>
                  <label className="block text-[11px] font-bold text-[#C59B27] uppercase tracking-wider mb-1.5">
                    Enter 6-Digit Email OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#C59B27] text-[#1C1613] text-center font-mono text-base font-bold outline-none shadow-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-1.5">
                  Create Account Password
                </label>
                <input
                  type="password"
                  placeholder="Set strong password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E0D8] text-[#1C1613] text-xs outline-none focus:border-[#D4A373] font-mono shadow-xs"
                />
              </div>

              <button
                onClick={() => registerMutation.mutate()}
                disabled={!otpCode || !regPassword || registerMutation.isPending}
                className="w-full h-13 bg-[#C59B27] hover:bg-[#B38B21] text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-[#C59B27]/20"
              >
                <ShieldCheck className="w-4 h-4" />
                {registerMutation.isPending ? "SUBMITTING REGISTRATION…" : "VERIFY OTP & REGISTER SALON"}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-[#6E6761]">
                  Already registered?{" "}
                  <button
                    onClick={() => setActiveMode("signin")}
                    className="font-bold text-[#C59B27] hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-8 text-[11px] text-[#9C948D]">
          © {new Date().getFullYear()} Snepr Technologies. All rights reserved.
        </div>
      </div>
    </div>
  );
}
