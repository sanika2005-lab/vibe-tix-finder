import { useMemo, useState } from "react";

export type SeatTier = "regular" | "vip" | "booked";

export interface Seat {
  id: string;
  row: string;
  num: number;
  tier: SeatTier;
}

const ROWS = ["A", "B", "C", "D", "E", "F"];
const COLS = 8;

// Deterministically pre-book a few seats per event so it feels "live"
const buildSeats = (eventId: string): Seat[] => {
  // simple hash from event id
  let seed = 0;
  for (let i = 0; i < eventId.length; i++) seed = (seed * 31 + eventId.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  const seats: Seat[] = [];
  for (const row of ROWS) {
    for (let n = 1; n <= COLS; n++) {
      const isVip = row === "A" || row === "B";
      const booked = rand() < 0.22;
      seats.push({
        id: `${row}${n}`,
        row,
        num: n,
        tier: booked ? "booked" : isVip ? "vip" : "regular",
      });
    }
  }
  return seats;
};

interface Props {
  eventId: string;
  basePrice: number;
  selected: string[];
  onChange: (ids: string[]) => void;
  max?: number;
}

const VIP_MULTIPLIER = 1.5;

export const seatPrice = (seat: Seat, basePrice: number) =>
  seat.tier === "vip" ? Math.round(basePrice * VIP_MULTIPLIER) : basePrice;

export const SeatSelector = ({ eventId, basePrice, selected, onChange, max = 6 }: Props) => {
  const seats = useMemo(() => buildSeats(eventId), [eventId]);
  const [hover, setHover] = useState<string | null>(null);

  const toggle = (s: Seat) => {
    if (s.tier === "booked") return;
    if (selected.includes(s.id)) {
      onChange(selected.filter((id) => id !== s.id));
    } else if (selected.length < max) {
      onChange([...selected, s.id]);
    }
  };

  const total = seats
    .filter((s) => selected.includes(s.id))
    .reduce((sum, s) => sum + seatPrice(s, basePrice), 0);

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-gradient-to-b from-primary/20 to-transparent p-2 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        ◀ Screen / Stage ▶
      </div>

      <div className="space-y-1.5">
        {ROWS.map((row) => (
          <div key={row} className="flex items-center justify-center gap-1.5">
            <span className="w-4 text-[10px] font-semibold text-muted-foreground">{row}</span>
            <div className="flex gap-1">
              {seats
                .filter((s) => s.row === row)
                .map((s) => {
                  const isSel = selected.includes(s.id);
                  const base =
                    "h-7 w-7 rounded-md text-[9px] font-semibold transition-smooth";
                  let cls = "";
                  if (s.tier === "booked") cls = "bg-muted text-muted-foreground/40 cursor-not-allowed";
                  else if (isSel) cls = "bg-primary text-primary-foreground ring-2 ring-primary/40 scale-110";
                  else if (s.tier === "vip") cls = "bg-amber-400/80 text-amber-950 hover:bg-amber-400";
                  else cls = "bg-emerald-500/80 text-white hover:bg-emerald-500";
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggle(s)}
                      onMouseEnter={() => setHover(s.id)}
                      onMouseLeave={() => setHover(null)}
                      disabled={s.tier === "booked"}
                      className={`${base} ${cls}`}
                      aria-label={`Seat ${s.id} ${s.tier}`}
                    >
                      {s.num}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-500/80" /> Available</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-400/80" /> VIP +50%</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-primary" /> Selected</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-muted" /> Booked</span>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-sm">
        <span className="text-muted-foreground">
          {selected.length} seat{selected.length === 1 ? "" : "s"}
          {selected.length > 0 && ` · ${selected.join(", ")}`}
        </span>
        <span className="font-semibold">₹{total.toLocaleString("en-IN")}</span>
      </div>

      {hover && (
        <p className="text-center text-[11px] text-muted-foreground">
          Seat {hover} — {seats.find((s) => s.id === hover)?.tier.toUpperCase()}
        </p>
      )}
    </div>
  );
};

export const computeSeatsTotal = (eventId: string, basePrice: number, selectedIds: string[]) => {
  const seats = buildSeats(eventId);
  return seats
    .filter((s) => selectedIds.includes(s.id))
    .reduce((sum, s) => sum + seatPrice(s, basePrice), 0);
};
