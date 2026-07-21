import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { joinWaitlist } from "../../../server/functions/waitlist";

export const Route = createFileRoute("/_marketing/")({
  component: HypePage,
  head: () => ({
    meta: [
      { title: "Something strange is coming | Snepr" },
    ],
  }),
});

function HypePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () => joinWaitlist({ data: { email } }),
    onSuccess: () => {
      setSubmitted(true);
      setEmail("");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#0A0806] flex flex-col items-center justify-center relative overflow-hidden text-center px-4">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[90px] pointer-events-none mix-blend-screen" />
      
      <div className="z-10 flex flex-col items-center max-w-2xl w-full">
        {/* Mysterious animated logo/mark */}
        <div className="mb-12 relative">
          <div className="w-24 h-24 border border-primary/30 rounded-full flex items-center justify-center relative animate-[spin_10s_linear_infinite]">
            <div className="w-16 h-16 border-t border-r border-primary/60 rounded-full absolute" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-white mb-6">
          Something <i className="font-serif italic text-primary/90 font-light">strange</i> is coming.
        </h1>
        
        <p className="text-lg md:text-xl text-white/50 mb-12 max-w-lg font-light tracking-wide">
          The way you wait is about to change forever. Be the first to know when the veil drops.
        </p>

        <div className="w-full max-w-md">
          {submitted ? (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <p className="font-medium tracking-widest uppercase text-sm">You are on the list.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative flex items-center w-full">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address" 
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-32 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-light tracking-wide"
              />
              <button 
                type="submit"
                disabled={mutation.isPending}
                className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-[#0A0806] font-bold rounded-full hover:bg-primary-hover transition-colors active:scale-95 disabled:opacity-50"
              >
                {mutation.isPending ? "..." : "Join"}
              </button>
            </form>
          )}
          {mutation.isError && (
            <p className="text-destructive text-sm mt-3 font-medium">Something went wrong. Please try again.</p>
          )}
        </div>
        
        <p className="mt-20 text-xs text-white/20 tracking-widest uppercase">
          Snepr &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
