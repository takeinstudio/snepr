import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getSalons } from "../../backend/functions/salons";
import { sendOtp, claimSalonWithOtp } from "../../backend/functions/otp";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ShieldCheck, X, Building2, Search, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_marketing/claim")({
  component: ClaimSalon,
  head: () => ({
    meta: [{ title: "Claim Your Salon Listing | Snepr" }],
  }),
});

function ClaimSalon() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSalon, setSelectedSalon] = useState<any | null>(null);

  // Claim Form State
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [claimNotes, setClaimNotes] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState("");

  const { data: salons, isLoading } = useQuery({
    queryKey: ["salons"],
    queryFn: async () => (await getSalons({ data: {} })) as any[],
  });

  const filteredSalons =
    salons?.filter(
      (s: any) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.address?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Send OTP Mutation
  const sendOtpMutation = useMutation({
    mutationFn: () => sendOtp({ data: { email } }),
    onSuccess: (res) => {
      setOtpSent(true);
      setOtpMessage(res.message);
      setClaimError("");
    },
    onError: (err: any) => setClaimError(err.message || "Failed to send OTP code."),
  });

  // Submit Claim Mutation
  const submitClaimMutation = useMutation({
    mutationFn: () =>
      claimSalonWithOtp({
        data: {
          salonId: selectedSalon.id,
          ownerName,
          phone,
          email,
          password,
          otpCode,
          claimNotes,
        },
      }),
    onSuccess: (res) => {
      setClaimSuccess(res.message);
      setClaimError("");
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2000);
    },
    onError: (err: any) => setClaimError(err.message || "Claim submission failed."),
  });

  return (
    <main className="min-h-screen bg-[#141210] text-[#F3EFEA] font-sans">
      <div className="bg-[#1A1714] py-16 border-b border-[#2D2824]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex px-3 py-1 bg-[#7A4B29]/20 text-[#D4A373] text-xs font-bold rounded-full mb-4 border border-[#7A4B29]/30">
            Salon Verification & Claim Portal
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Claim Your Salon Business
          </h1>
          <p className="text-sm text-[#A69F96] max-w-2xl mx-auto mb-8">
            Search for your pre-listed salon below to claim ownership, set up your owner account, and verify via Email OTP.
          </p>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E867E]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or address (e.g. Patia, Jawed Habib)"
              className="w-full rounded-2xl border border-[#2D2824] bg-[#141210] pl-11 pr-6 py-4 text-xs text-white shadow-md focus:outline-none focus:border-[#7A4B29] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {isLoading ? (
          <p className="text-center text-[#8E867E] text-xs">Loading salon directory...</p>
        ) : filteredSalons.length === 0 ? (
          <div className="text-center py-12 bg-[#1A1714] border border-[#2D2824] rounded-2xl">
            <p className="text-sm text-[#A69F96] mb-4">Can't find your salon listed?</p>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="px-6 py-3 bg-[#7A4B29] text-white text-xs font-bold rounded-xl hover:bg-[#8F5A33] shadow transition-all"
            >
              Register your salon from scratch
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSalons.map((salon: any) => (
              <div
                key={salon.id}
                className="p-6 bg-[#1A1714] border border-[#2D2824] rounded-2xl flex flex-col justify-between hover:border-[#7A4B29] transition-all shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-base text-white">{salon.name}</h3>
                    {salon.rating && (
                      <span className="bg-amber-400/10 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-400/20">
                        ⭐ {salon.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8E867E] mb-4">{salon.address}</p>
                </div>

                <button
                  onClick={() => setSelectedSalon(salon)}
                  className="w-full py-2.5 bg-[#7A4B29] hover:bg-[#8F5A33] text-white font-bold text-xs rounded-xl transition-all shadow"
                >
                  Claim This Salon Business
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── CLAIM BUSINESS MODAL ─── */}
      {selectedSalon && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1714] border border-[#2D2824] p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2D2824] pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Claim {selectedSalon.name}</h3>
                <p className="text-[11px] text-[#8E867E]">{selectedSalon.address}</p>
              </div>
              <button onClick={() => setSelectedSalon(null)} className="text-[#8E867E] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {claimError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {claimError}
              </div>
            )}
            {claimSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                {claimSuccess}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A69F96] font-bold mb-1">Owner Full Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white outline-none focus:border-[#7A4B29]"
                />
              </div>

              <div>
                <label className="block text-[#A69F96] font-bold mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white outline-none focus:border-[#7A4B29]"
                />
              </div>

              <div>
                <label className="block text-[#A69F96] font-bold mb-1">Owner Email (For Verification)</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="owner@snepr.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white outline-none focus:border-[#7A4B29]"
                  />
                  <button
                    onClick={() => sendOtpMutation.mutate()}
                    disabled={!email || sendOtpMutation.isPending}
                    className="px-3.5 py-2.5 bg-[#D4A373] text-[#141210] font-bold rounded-xl shrink-0 disabled:opacity-50"
                  >
                    {sendOtpMutation.isPending ? "Sending…" : otpSent ? "Resend" : "Send OTP"}
                  </button>
                </div>
                {otpMessage && <p className="text-[10px] text-emerald-400 mt-1 font-semibold">{otpMessage}</p>}
              </div>

              {otpSent && (
                <div>
                  <label className="block text-[#D4A373] font-bold mb-1">Enter 6-Digit Email OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#25211D] border border-[#D4A373]/40 rounded-xl text-white text-center font-mono text-base font-bold outline-none focus:border-[#D4A373]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[#A69F96] font-bold mb-1">Create Account Password</label>
                <input
                  type="password"
                  placeholder="Set account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white outline-none focus:border-[#7A4B29] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#A69F96] font-bold mb-1">Claim Notes / Verification Proof</label>
                <textarea
                  rows={2}
                  placeholder="e.g. I am the manager/owner of Jawed Habib Patia branch"
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#2D2824] rounded-xl text-white outline-none focus:border-[#7A4B29]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button onClick={() => setSelectedSalon(null)} className="px-4 py-2 text-xs font-bold text-[#A69F96]">
                Cancel
              </button>
              <button
                onClick={() => submitClaimMutation.mutate()}
                disabled={!otpCode || !password || submitClaimMutation.isPending}
                className="px-5 py-2 bg-[#7A4B29] hover:bg-[#8F5A33] text-white font-bold text-xs rounded-xl shadow disabled:opacity-50"
              >
                {submitClaimMutation.isPending ? "Submitting…" : "Verify OTP & Submit Claim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
