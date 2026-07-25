import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LogOut, User } from "lucide-react";
import { SneprWordmark } from "@/components/SneprWordmark";
import { openNativeApp } from "@/config/app-promo";
import { useState, useEffect } from "react";

export function Navbar() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const checkSession = () => {
      try {
        const data = localStorage.getItem("snepr_session");
        if (data) {
          setSession(JSON.parse(data));
        } else {
          setSession(null);
        }
      } catch {
        setSession(null);
      }
    };
    checkSession();
    window.addEventListener("storage", checkSession);
    return () => window.removeEventListener("storage", checkSession);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("snepr_session");
    } catch {}
    setSession(null);
    window.dispatchEvent(new Event("storage"));
    navigate({ to: "/" });
  };

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/85 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:h-24 sm:px-6">
        <Link to="/" className="flex items-center py-2" aria-label="Snepr home">
          <SneprWordmark height={48} color="#101012" className="sm:hidden" />
          <SneprWordmark height={58} color="#101012" className="hidden sm:block" />
        </Link>
        <nav className="hidden items-center gap-6 text-[15px] font-semibold text-ink-soft md:flex lg:gap-8">
          <Link to="/" className="transition hover:text-ink">
            Home
          </Link>
          <Link to="/" hash="how" className="transition hover:text-ink">
            How it works
          </Link>
          <Link to="/live" className="transition hover:text-ink">
            Live queue
          </Link>
          <Link to="/about" className="transition hover:text-ink">
            About
          </Link>
          <Link to="/faq" className="transition hover:text-ink">
            FAQ
          </Link>
          <Link to="/contact" className="transition hover:text-ink">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-[#F5EDE4] text-xs font-bold text-[#7A4B29]">
                <User className="w-3.5 h-3.5 text-[#7A4B29]" />
                {session.name || "Customer"}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-[13px] font-bold text-ink hover:bg-surface transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openNativeApp()}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-bold text-primary-foreground shadow-green press press-active hover:bg-primary-hover sm:h-11 sm:px-6 sm:text-[15px]"
            >
              Open app
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
