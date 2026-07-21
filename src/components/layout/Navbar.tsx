import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SneprWordmark } from "@/components/SneprWordmark";
import { toast } from "sonner";

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/85 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link to="/" className="flex items-center" aria-label="Snepr home">
          <SneprWordmark height={22} color="#101012" className="sm:hidden" />
          <SneprWordmark height={26} color="#101012" className="hidden sm:block" />
        </Link>
        <nav className="hidden items-center gap-6 text-[14px] font-medium text-ink-soft md:flex lg:gap-8">
          <Link to="/" className="transition hover:text-ink">
            Home
          </Link>
          <Link to="/" hash="how" className="transition hover:text-ink">
            How it works
          </Link>
          <Link to="/" hash="live" className="transition hover:text-ink">
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
        <button
          type="button"
          onClick={() => {
            toast.promise(
              new Promise((resolve) => setTimeout(resolve, 800)),
              {
                loading: "Opening app interface...",
                success: "Snepr web app coming soon!",
                error: "Failed to open app",
              }
            );
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-green press press-active hover:bg-primary-hover sm:h-10 sm:px-5 sm:text-[14px]"
        >
          Open app
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
