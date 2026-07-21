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
              Customers
            </h3>
            <ul className="flex flex-col gap-3 text-[14px] text-ink-soft">
              <li>
                <Link to="/app" className="transition hover:text-ink">
                  Find Salons
                </Link>
              </li>
              <li>
                <Link to="/app" className="transition hover:text-ink">
                  Join Live Queue
                </Link>
              </li>
              <li>
                <Link to="/app" className="transition hover:text-ink">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/app" className="transition hover:text-ink">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-[14px] font-bold uppercase tracking-wider text-ink">
              Businesses
            </h3>
            <ul className="flex flex-col gap-3 text-[14px] text-ink-soft">
              <li>
                <Link to="/list-salon" className="transition hover:text-ink">
                  List Your Salon
                </Link>
              </li>
              <li>
                <Link to="/claim" className="transition font-semibold text-primary hover:text-primary-hover">
                  Claim Your Salon
                </Link>
              </li>
              <li>
                <Link to="/partner-dashboard" className="transition hover:text-ink">
                  Partner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="transition hover:text-ink">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/partner-terms" className="transition hover:text-ink">
                  Partner Terms
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition hover:text-ink">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-[14px] font-bold uppercase tracking-wider text-ink">
              Company & Legal
            </h3>
            <ul className="flex flex-col gap-3 text-[14px] text-ink-soft">
              <li>
                <Link to="/about" className="transition hover:text-ink">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-ink">
                  Contact
                </Link>
              </li>
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
