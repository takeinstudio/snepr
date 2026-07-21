import { Link } from "@tanstack/react-router";
import { SneprWordmark } from "@/components/SneprWordmark";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link to="/" className="inline-block" aria-label="Snepr home">
              <SneprWordmark height={24} color="#101012" />
            </Link>
            <p className="text-[14px] text-ink-soft">
              Live salon queues and wait times. Join from your phone and walk straight in.
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 text-[14px] font-bold uppercase tracking-wider text-ink">
              Product
            </h3>
            <ul className="flex flex-col gap-3 text-[14px] text-ink-soft">
              <li>
                <Link to="/" hash="how" className="transition hover:text-ink">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/" hash="live" className="transition hover:text-ink">
                  Live queue
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition hover:text-ink">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-[14px] font-bold uppercase tracking-wider text-ink">
              Company
            </h3>
            <ul className="flex flex-col gap-3 text-[14px] text-ink-soft">
              <li>
                <Link to="/about" className="transition hover:text-ink">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-ink">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-[14px] font-bold uppercase tracking-wider text-ink">
              Legal
            </h3>
            <ul className="flex flex-col gap-3 text-[14px] text-ink-soft">
              <li>
                <Link to="/privacy-policy" className="transition hover:text-ink">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="transition hover:text-ink">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-[13px] text-ink-soft sm:flex-row">
          <p>© {new Date().getFullYear()} Snepr. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="transition hover:text-ink" aria-label="Twitter">Twitter</a>
            <a href="#" className="transition hover:text-ink" aria-label="Instagram">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
