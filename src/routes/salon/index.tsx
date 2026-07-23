import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type SessionUser } from "../../backend/functions/auth";
import { useState, useEffect } from "react";
import { SalonOSPortal } from "@/components/salon/SalonOSPortal";

export const Route = createFileRoute("/salon/")({
  component: SalonDashboard,
});

function SalonDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("snepr_session");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!session) {
      navigate({ to: "/login" });
    }
  }, [session, navigate]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#141210] flex items-center justify-center text-[#A69F96] text-xs">
        Redirecting to login portal…
      </div>
    );
  }

  if (!["super_admin", "sub_admin", "salon_owner", "staff"].includes(session.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141210] text-[#A69F96] text-xs">
        <p>Access denied to SalonOS.</p>
      </div>
    );
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem("snepr_session");
    } catch {}
    setSession(null);
    navigate({ to: "/login" });
  };

  return <SalonOSPortal session={session} onLogout={handleLogout} />;
}
