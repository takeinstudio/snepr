import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Scissors, Search, Sparkles, Zap } from "lucide-react";
import { SneprWordmark } from "@/components/SneprWordmark";
import {
  SalonRow,
  StatusDot,
  StatusPill,
  type QueueStatus,
} from "@/components/snepr/QueueCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Snepr — Know before you go" },
      {
        name: "description",
        content:
          "Live salon queues and wait times. Join from your phone and walk straight in.",
      },
    ],
  }),
  component: SneprLanding,
});

/* ------------------------------ Nav ------------------------------ */
function Nav() {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-transparent bg-background/85 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <a href="#top" className="flex items-center" aria-label="Snepr home">
          <SneprWordmark height={22} color="#101012" className="sm:hidden" />
          <SneprWordmark height={26} color="#101012" className="hidden sm:block" />
        </a>
        <nav className="hidden items-center gap-8 text-[14px] font-medium text-ink-soft md:flex">
          <a href="#how" className="transition hover:text-ink">
            How it works
          </a>
          <a href="#live" className="transition hover:text-ink">
            Live queue
          </a>
          <a href="#owners" className="transition hover:text-ink">
            For salons
          </a>
        </nav>
        <a
          href="#get"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-green press press-active hover:bg-primary-hover sm:h-10 sm:px-5 sm:text-[14px]"
        >
          Open app
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  );
}

/* ------------------------------ Hero ------------------------------ */
function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-10 pt-8 sm:px-6 sm:pt-14 md:pt-20">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-14">
        <div className="rise-in">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-soft">
            <span className="live-dot" />
            <span>Live in 240+ salons</span>
          </div>
          <h1 className="font-display text-[44px] font-bold leading-[0.95] tracking-tight text-ink sm:text-[64px] md:text-[76px]">
            Know before
            <br />
            you go.
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-soft sm:text-[18px]">
            Never wait at a salon again. See live queues, join from your phone,
            and walk straight into the chair.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#get"
              className="inline-flex h-14 items-center gap-2 rounded-2xl bg-primary px-6 text-[16px] font-semibold text-primary-foreground shadow-green press press-active hover:bg-primary-hover"
            >
              <MapPin className="h-5 w-5" />
              Find a salon near you
            </a>
            <a
              href="#how"
              className="inline-flex h-14 items-center gap-2 rounded-2xl border border-border bg-card px-5 text-[15px] font-semibold text-ink press press-active hover:bg-surface"
            >
              How it works
            </a>
          </div>

          <div className="mt-8 flex items-center gap-6 text-[12.5px] text-ink-soft">
            <div>
              <div className="font-mono-tabular text-[20px] font-bold text-ink">
                4.8★
              </div>
              <div>32k ratings</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="font-mono-tabular text-[20px] font-bold text-ink">
                &lt;90s
              </div>
              <div>avg. join time</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="font-mono-tabular text-[20px] font-bold text-ink">
                0₹
              </div>
              <div>for customers</div>
            </div>
          </div>
        </div>

        <HeroQueueCard />
      </div>
    </section>
  );
}

function HeroQueueCard() {
  return (
    <div className="rise-in relative mx-auto w-full max-w-md">
      {/* Ambient green blob */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[40px] bg-primary/10 blur-2xl"
      />
      <div className="rounded-[28px] border border-border bg-card p-4 shadow-elevated sm:p-5">
        {/* Search bar */}
        <div className="flex items-center gap-2 rounded-2xl bg-surface px-3.5 py-3">
          <Search className="h-4 w-4 text-ink-soft" />
          <span className="text-[13.5px] text-ink-soft">Salons near Indiranagar</span>
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold text-primary">
            LIVE
          </span>
        </div>

        <div className="mt-3 space-y-2">
          <SalonRow
            initial="U"
            name="Urban Chop"
            meta="0.4 km · Men's · ₹300"
            wait="5 min"
            status="available"
            tint="bg-primary/15"
          />
          <SalonRow
            initial="L"
            name="Looks Salon"
            meta="0.8 km · Unisex · ₹450"
            wait="18 min"
            status="finishing"
            tint="bg-status-finishing/15"
          />
          <SalonRow
            initial="B"
            name="Barbershop Co."
            meta="1.2 km · Men's · ₹250"
            wait="42 min"
            status="busy"
            tint="bg-status-busy/15"
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-ink px-4 py-3">
          <div className="text-[12.5px] font-medium text-white/70">
            Fastest chair right now
          </div>
          <div className="font-mono-tabular text-[15px] font-bold text-primary">
            5 min · Urban Chop
          </div>
        </div>
      </div>

      {/* Floating pill */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white shadow-card">
        Updated 2s ago
      </div>
    </div>
  );
}

/* --------------------------- How it works --------------------------- */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "See the wait",
      copy: "Live status from every chair, updated by the second.",
      preview: <MiniSeeWait />,
    },
    {
      n: "02",
      title: "Join the queue",
      copy: "Tap once. Your spot is locked in from anywhere.",
      preview: <MiniJoin />,
    },
    {
      n: "03",
      title: "Walk straight in",
      copy: "We ping you when it's time. No waiting room, ever.",
      preview: <MiniWalkIn />,
    },
  ];
  return (
    <section id="how" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 text-[12px] font-semibold uppercase tracking-widest text-primary">
            How it works
          </div>
          <h2 className="font-display text-[36px] font-bold leading-[1] tracking-tight text-ink sm:text-[52px]">
            Three taps between
            <br />
            you and the chair.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {steps.map((s) => (
            <div
              key={s.n}
              className="group rounded-3xl border border-border bg-card p-5 shadow-card press press-active sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="font-mono-tabular text-[13px] font-bold text-primary">
                  {s.n}
                </span>
                <span className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="mb-5 overflow-hidden rounded-2xl bg-surface p-4">
                {s.preview}
              </div>
              <h3 className="text-[20px] font-bold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
                {s.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniSeeWait() {
  return (
    <div className="space-y-1.5">
      {[
        { name: "Chair 1", w: "5 min", s: "available" as QueueStatus },
        { name: "Chair 2", w: "18 min", s: "finishing" as QueueStatus },
        { name: "Chair 3", w: "42 min", s: "busy" as QueueStatus },
      ].map((r) => (
        <div
          key={r.name}
          className="flex items-center justify-between rounded-xl bg-card px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <StatusDot status={r.s} />
            <span className="text-[13px] font-medium text-ink">{r.name}</span>
          </div>
          <span className="font-mono-tabular text-[13px] font-bold text-ink">
            {r.w}
          </span>
        </div>
      ))}
    </div>
  );
}

function MiniJoin() {
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="rounded-xl bg-card p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
          Your slot
        </div>
        <div className="mt-1 font-mono-tabular text-[22px] font-bold text-ink">
          #4 <span className="text-[13px] font-semibold text-ink-soft">in line</span>
        </div>
      </div>
      <button
        type="button"
        className="w-full rounded-xl bg-primary py-2.5 text-[13px] font-bold text-primary-foreground press press-active"
      >
        Join queue
      </button>
    </div>
  );
}

function MiniWalkIn() {
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="rounded-xl bg-primary/10 p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <span className="live-dot" /> You're up
        </div>
        <div className="mt-1 font-mono-tabular text-[22px] font-bold text-ink">
          Chair 2 · now
        </div>
      </div>
      <div className="rounded-xl bg-card p-2.5 text-[12px] text-ink-soft">
        We saved you <span className="font-semibold text-ink">37 min</span> today.
      </div>
    </div>
  );
}

/* ---------------------- Live Queue Showcase ---------------------- */
function LiveShowcase() {
  const [tick, setTick] = useState(23);
  useEffect(() => {
    const t = setInterval(() => {
      setTick((n) => (n <= 1 ? 24 : n - 1));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const barbers: {
    name: string;
    role: string;
    status: QueueStatus;
    eta: string;
  }[] = [
    { name: "Arjun", role: "Sr. Stylist", status: "available", eta: "Now" },
    { name: "Priya", role: "Color specialist", status: "finishing", eta: "8 min" },
    { name: "Rahul", role: "Barber", status: "busy", eta: "34 min" },
    { name: "Zoya", role: "Sr. Stylist", status: "available", eta: "Now" },
  ];

  return (
    <section id="live" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-primary">
              <span className="live-dot" /> Live right now
            </div>
            <h2 className="font-display text-[36px] font-bold leading-[1] tracking-tight text-ink sm:text-[52px]">
              This is your salon,
              <br />
              in real time.
            </h2>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-elevated">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-border p-5 sm:p-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-white">
                <Scissors className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[16px] font-bold text-ink sm:text-[18px]">
                  Urban Chop · Indiranagar
                </div>
                <div className="flex items-center gap-2 text-[12.5px] text-ink-soft">
                  <span className="live-dot" />
                  <span>Live · updated just now</span>
                </div>
              </div>
            </div>
            <StatusPill status="available" />
          </div>

          {/* Big number */}
          <div className="grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:p-6 md:gap-8">
            <div className="rounded-3xl bg-ink p-6 text-white sm:p-8">
              <div className="text-[12px] font-semibold uppercase tracking-widest text-white/60">
                Shortest wait
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span
                  key={tick}
                  className="tick-in font-mono-tabular text-[80px] font-bold leading-none text-primary sm:text-[110px]"
                >
                  {tick}
                </span>
                <span className="font-mono-tabular text-[22px] font-bold text-white sm:text-[28px]">
                  min
                </span>
              </div>
              <div className="mt-2 text-[13px] text-white/70">
                4 stylists working · 6 in queue
              </div>

              <button
                type="button"
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-5 text-[14px] font-bold text-primary-foreground press press-active hover:bg-primary-hover"
              >
                Join the queue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                <span>Stylist</span>
                <span>Next slot</span>
              </div>
              <div className="space-y-1.5">
                {barbers.map((b) => (
                  <div
                    key={b.name}
                    className="flex items-center gap-3 rounded-2xl bg-surface p-3"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-[13px] font-bold text-ink">
                      {b.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[14.5px] font-semibold text-ink">
                          {b.name}
                        </span>
                        <StatusPill status={b.status} />
                      </div>
                      <div className="text-[12px] text-ink-soft">{b.role}</div>
                    </div>
                    <div
                      className={cn(
                        "font-mono-tabular text-[14px] font-bold",
                        b.status === "available" && "text-status-available",
                        b.status === "finishing" && "text-status-finishing",
                        b.status === "busy" && "text-status-busy",
                      )}
                    >
                      {b.eta}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------- For Salon Owners ---------------------- */
function ForOwners() {
  return (
    <section id="owners" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-primary p-6 sm:p-10 md:p-14">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-ink/10 px-3 py-1.5 text-[12px] font-semibold text-ink">
              <Sparkles className="h-3.5 w-3.5" /> For salon owners
            </div>
            <h2 className="font-display text-[38px] font-bold leading-[0.98] tracking-tight text-ink sm:text-[56px]">
              One tap to fill
              <br />
              every empty chair.
            </h2>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink/80">
              Update chair status in a single tap. We route ready-to-pay customers
              straight to you. Commission only — zero setup, zero monthly fees.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#get"
                className="inline-flex h-13 items-center gap-2 rounded-2xl bg-ink px-6 py-3.5 text-[15px] font-bold text-white press press-active hover:bg-ink/90"
              >
                List your salon
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#get"
                className="inline-flex h-13 items-center gap-2 rounded-2xl border border-ink/25 bg-transparent px-5 py-3.5 text-[14px] font-semibold text-ink press press-active hover:bg-ink/5"
              >
                See partner terms
              </a>
            </div>
          </div>

          <OwnerStatCard />
        </div>
      </div>
    </section>
  );
}

function OwnerStatCard() {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-elevated sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-widest text-ink-soft">
            This week
          </div>
          <div className="mt-1 font-mono-tabular text-[36px] font-bold text-ink sm:text-[42px]">
            ₹48,320
          </div>
          <div className="text-[13px] font-medium text-primary">
            +23% vs last week
          </div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Zap className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { d: "M", v: 40 },
          { d: "T", v: 62 },
          { d: "W", v: 55 },
          { d: "T", v: 78 },
          { d: "F", v: 92 },
          { d: "S", v: 100 },
        ].map((c) => (
          <div key={c.d + c.v} className="flex flex-col items-center gap-1.5">
            <div className="flex h-16 w-full items-end rounded-lg bg-surface p-1">
              <div
                className="w-full rounded bg-primary"
                style={{ height: `${c.v}%` }}
              />
            </div>
            <span className="text-[10.5px] font-semibold text-ink-soft">
              {c.d}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
            Queue joins
          </div>
          <div className="mt-1 font-mono-tabular text-[22px] font-bold text-ink">
            412
          </div>
        </div>
        <div className="rounded-2xl bg-surface p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
            No-shows
          </div>
          <div className="mt-1 font-mono-tabular text-[22px] font-bold text-ink">
            2.1%
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Get Snepr ---------------------- */
function GetSnepr() {
  return (
    <section id="get" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-[40px] font-bold leading-[1] tracking-tight text-ink sm:text-[64px]">
          Skip the wait.
          <br />
          <span className="text-primary">Get Snepr.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-ink-soft sm:text-[17px]">
          No signup. Free for customers. Works in every partner salon near you.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#top"
            className="inline-flex h-14 items-center gap-2 rounded-2xl bg-primary px-7 text-[16px] font-bold text-primary-foreground shadow-green press press-active hover:bg-primary-hover"
          >
            Get Snepr
            <ArrowRight className="h-5 w-5" />
          </a>
          <a
            href="#owners"
            className="inline-flex h-14 items-center rounded-2xl border border-border bg-card px-6 text-[15px] font-semibold text-ink press press-active hover:bg-surface"
          >
            I run a salon
          </a>
        </div>

        <p className="mt-5 text-[12.5px] text-ink-soft">
          Works on any phone · Under 3 MB · No account required
        </p>
      </div>
    </section>
  );
}

/* ---------------------- Footer ---------------------- */
function Footer() {
  const cols = [
    {
      title: "Product",
      links: ["How it works", "Live queue", "For salons", "Pricing"],
    },
    {
      title: "Company",
      links: ["About", "Careers", "Press", "Contact"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Cookies"],
    },
  ];
  return (
    <footer
      className="border-t border-border px-4 pb-12 pt-12 sm:px-6"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <SneprWordmark height={28} color="#101012" />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-ink-soft">
              Live salon queues and wait times. Know before you go.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-widest text-ink-soft">
                {c.title}
              </div>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[14px] font-medium text-ink transition hover:text-primary"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-[12.5px] text-ink-soft">
          <span>© {new Date().getFullYear()} Snepr. All rights reserved.</span>
          <span>Made for people who hate waiting.</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------- Sticky mobile CTA ---------------------- */
function StickyMobileCTA() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-3 pt-3 backdrop-blur md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
    >
      <a
        href="#get"
        className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[15px] font-bold text-primary-foreground shadow-green press press-active"
      >
        <MapPin className="h-5 w-5" />
        Find a salon near you
      </a>
    </div>
  );
}

/* ---------------------- Page ---------------------- */
function SneprLanding() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <LiveShowcase />
        <ForOwners />
        <GetSnepr />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
