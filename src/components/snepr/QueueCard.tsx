import { cn } from "@/lib/utils";

export type QueueStatus = "available" | "finishing" | "busy";

const STATUS: Record<
  QueueStatus,
  { label: string; dot: string; pill: string; text: string }
> = {
  available: {
    label: "Available",
    dot: "bg-status-available",
    pill: "bg-status-available/10 text-status-available",
    text: "text-status-available",
  },
  finishing: {
    label: "Finishing",
    dot: "bg-status-finishing",
    pill: "bg-status-finishing/10 text-status-finishing",
    text: "text-status-finishing",
  },
  busy: {
    label: "Busy",
    dot: "bg-status-busy",
    pill: "bg-status-busy/10 text-status-busy",
    text: "text-status-busy",
  },
};

export function StatusDot({ status, pulse = false }: { status: QueueStatus; pulse?: boolean }) {
  const s = STATUS[status];
  return (
    <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
      {pulse && status === "available" && (
        <span className="absolute inset-0 rounded-full bg-status-available/60 animate-ping" />
      )}
      <span className={cn("relative h-2.5 w-2.5 rounded-full", s.dot)} />
    </span>
  );
}

export function StatusPill({ status }: { status: QueueStatus }) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        s.pill,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

type SalonRowProps = {
  name: string;
  meta: string;
  wait: string;
  status: QueueStatus;
  initial: string;
  tint?: string;
};

export function SalonRow({ name, meta, wait, status, initial, tint = "bg-surface-2" }: SalonRowProps) {
  const s = STATUS[status];
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3 press press-active">
      <div
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-[15px] font-bold text-ink",
          tint,
        )}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[15px] font-semibold text-ink">{name}</p>
          <StatusDot status={status} pulse={status === "available"} />
        </div>
        <p className="truncate text-[12.5px] text-ink-soft">{meta}</p>
      </div>
      <div className="text-right">
        <div className={cn("font-mono-tabular text-[17px] font-bold leading-none", s.text)}>
          {wait}
        </div>
        <div className="mt-1 text-[10.5px] font-medium uppercase tracking-wider text-ink-soft">
          wait
        </div>
      </div>
    </div>
  );
}
