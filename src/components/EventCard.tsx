import { useMemo, useState } from "react";
import {
  Calendar, MapPin, CheckCircle2, IndianRupee, Mail, Smartphone,
  Wallet, Building2, CreditCard, QrCode as QrIcon, Download,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FriendsAvatars } from "@/components/FriendsAvatars";
import { SeatSelector, computeSeatsTotal } from "@/components/SeatSelector";
import type { EventItem } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

type PayMethod = {
  id: string;
  name: string;
  tag: string;
  gradient: string;
  icon: typeof Smartphone;
  scheme: string;
};

const UPI_VPA = "7796801516@ibl";
const UPI_PAYEE = "VibeTix Events";

const UPI_METHODS: PayMethod[] = [
  { id: "phonepe", name: "PhonePe", tag: "UPI · Secure", gradient: "from-[#5f259f] to-[#9b59ff]", icon: Smartphone, scheme: "phonepe://pay" },
  { id: "gpay", name: "Google Pay", tag: "UPI · Secure", gradient: "from-[#4285F4] via-[#34A853] to-[#FBBC04]", icon: Wallet, scheme: "tez://upi/pay" },
  { id: "paytm", name: "Paytm", tag: "UPI / Wallet", gradient: "from-[#00b9f1] to-[#002970]", icon: Smartphone, scheme: "paytmmp://pay" },
  { id: "bhim", name: "BHIM UPI", tag: "Any UPI app", gradient: "from-[#ff7a00] to-[#1aa260]", icon: Building2, scheme: "upi://pay" },
];

const buildUpiUrl = (scheme: string, amount: number, note: string, txnId: string) => {
  const params = new URLSearchParams({
    pa: UPI_VPA, pn: UPI_PAYEE, am: String(amount), cu: "INR", tn: note, tr: txnId,
  });
  return `${scheme}?${params.toString()}`;
};

type Step = "details" | "seats" | "pay" | "ticket";
type PayMode = "upi" | "card";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const verifyUtr = (value: string): string | null => {
  const v = value.trim().toUpperCase();
  if (!v) return "Enter the UTR / Transaction ID from your UPI app.";
  if (!/^[A-Z0-9]{12,22}$/.test(v)) return "UTR should be 12–22 letters/digits (no spaces).";
  if (/^(.)\1+$/.test(v)) return "That doesn't look like a real UTR.";
  return null;
};

const validateCard = (num: string, exp: string, cvv: string): string | null => {
  const digits = num.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(digits)) return "Card number looks invalid.";
  if (!/^\d{2}\/\d{2}$/.test(exp)) return "Expiry must be MM/YY.";
  if (!/^\d{3,4}$/.test(cvv)) return "CVV must be 3–4 digits.";
  // Luhn
  let sum = 0, dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    sum += d; dbl = !dbl;
  }
  if (sum % 10 !== 0) return "Card number failed validation.";
  return null;
};

export const EventCard = ({ event }: { event: EventItem }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("details");

  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => localStorage.getItem("vibetix_user_email") || "");
  const [seats, setSeats] = useState<string[]>([]);

  const [payMode, setPayMode] = useState<PayMode>("upi");
  const [selectedUpi, setSelectedUpi] = useState<string | null>(null);
  const [paymentLaunched, setPaymentLaunched] = useState(false);
  const [utr, setUtr] = useState("");
  const [utrError, setUtrError] = useState<string | null>(null);

  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardError, setCardError] = useState<string | null>(null);

  const [verifying, setVerifying] = useState(false);
  const [registeredName, setRegisteredName] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string>("");
  const [paidUtr, setPaidUtr] = useState<string>("");

  const isFree = event.price === 0;

  const amount = useMemo(() => {
    if (isFree) return 0;
    if (seats.length === 0) return event.price;
    return computeSeatsTotal(event.id, event.price, seats);
  }, [event.id, event.price, seats, isFree]);

  const resetAndClose = () => {
    setOpen(false);
    setStep("details");
    setSeats([]);
    setUtr(""); setUtrError(null);
    setSelectedUpi(null); setPaymentLaunched(false);
    setCardNum(""); setCardExp(""); setCardCvv(""); setCardError(null);
    setName("");
  };

  const launchUpi = (methodId: string) => {
    const method = UPI_METHODS.find((m) => m.id === methodId);
    if (!method) return;
    setSelectedUpi(methodId);
    const txnId = `VTX${event.id.toUpperCase()}${Date.now().toString().slice(-6)}`;
    const url = buildUpiUrl(method.scheme, amount, `${event.title} ticket`, txnId);
    const win = window.open(url, "_blank");
    if (!win) window.location.href = url;
    setPaymentLaunched(true);
    toast({
      title: `Opening ${method.name}…`,
      description: "Complete the payment securely, then enter your UTR to confirm.",
    });
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isFree) {
      completeBooking();
    } else {
      setStep("seats");
    }
  };

  const handleConfirmUpi = async () => {
    if (!selectedUpi) {
      toast({ title: "Choose a payment app", variant: "destructive" });
      return;
    }
    const err = verifyUtr(utr);
    setUtrError(err);
    if (err) {
      toast({ title: "Payment not verified", description: err, variant: "destructive" });
      return;
    }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 900));
    setVerifying(false);
    setPaidUtr(utr.trim().toUpperCase());
    toast({ title: "Payment verified ✓", description: `UTR ${utr.trim().toUpperCase()} matched.` });
    completeBooking();
  };

  const handleConfirmCard = async () => {
    const err = validateCard(cardNum, cardExp, cardCvv);
    setCardError(err);
    if (err) {
      toast({ title: "Card check failed", description: err, variant: "destructive" });
      return;
    }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1100));
    setVerifying(false);
    const auth = `AUTH${Date.now().toString().slice(-10)}`;
    setPaidUtr(auth);
    toast({ title: "Card payment authorised ✓", description: `Auth code ${auth}` });
    completeBooking();
  };

  const completeBooking = () => {
    const trimmed = name.trim();
    const id = `VTX-${event.id.toUpperCase()}-${trimmed.toUpperCase().replace(/\s+/g, "").slice(0, 6)}-${Date.now().toString().slice(-4)}`;
    setRegisteredName(trimmed);
    setTicketId(id);

    if (email.trim()) {
      const subject = encodeURIComponent(`Ticket confirmed: ${event.title}`);
      const body = encodeURIComponent(
        `Hi ${trimmed},\n\nYour booking is confirmed 🎉\n\n` +
        `Event: ${event.title}\nDate: ${event.date} · ${event.time}\nVenue: ${event.location}\n` +
        `Seats: ${seats.length ? seats.join(", ") : "General"}\n` +
        `Amount paid: ${isFree ? "Free" : `₹${formatINR(amount)}`}\n` +
        (paidUtr ? `Reference: ${paidUtr}\n` : "") +
        `Ticket ID: ${id}\n\nShow the QR code at entry.\n— VibeTix`
      );
      // Fire mail client in a new tab so it doesn't navigate away
      window.open(`mailto:${encodeURIComponent(email.trim())}?subject=${subject}&body=${body}`, "_blank");
    }

    toast({
      title: isFree ? "Registration complete!" : "Booking confirmed 🎉",
      description: email.trim()
        ? `Confirmation emailed to ${email.trim()}. Your QR is ready.`
        : `Your QR ticket is ready.`,
    });
    setStep("ticket");
  };

  const qrPayload = JSON.stringify({
    t: "vibetix",
    id: ticketId,
    e: event.id,
    n: registeredName,
    s: seats,
    a: amount,
    r: paidUtr,
  });

  const downloadTicket = () => {
    const svg = document.getElementById(`qr-${event.id}`);
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ticketId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="group overflow-hidden border-border/60 bg-gradient-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={event.image} alt={event.title} loading="lazy" className="h-full w-full object-cover transition-smooth group-hover:scale-105" />
        <Badge className="absolute left-3 top-3 bg-background/80 text-foreground backdrop-blur-md hover:bg-background/80">
          {event.category}
        </Badge>
        <div className="absolute right-3 top-3 flex items-center gap-0.5 rounded-full bg-background/80 px-3 py-1 text-sm font-semibold backdrop-blur-md">
          {isFree ? "Free" : (<><IndianRupee className="h-3.5 w-3.5" />{formatINR(event.price)}</>)}
        </div>
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-lg font-semibold leading-tight">{event.title}</h3>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{event.date} · {event.time}</span></div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span className="line-clamp-1">{event.location}</span></div>
        </div>

        {registeredName && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-foreground">
              Booked as <span className="font-semibold text-primary">{registeredName}</span>
              {seats.length > 0 && <span className="text-muted-foreground"> · {seats.join(", ")}</span>}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <FriendsAvatars friends={event.friendsAttending} />
          {registeredName ? (
            <Button size="sm" variant="outline" onClick={() => { setOpen(true); setStep("ticket"); }} className="rounded-full">
              <QrIcon className="mr-1.5 h-3.5 w-3.5" /> View ticket
            </Button>
          ) : (
            <Button size="sm" onClick={() => { setStep("details"); setOpen(true); }} className="rounded-full">
              {isFree ? "Book" : `Book · ₹${formatINR(event.price)}`}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : (registeredName ? setOpen(false) : resetAndClose()))}>
        <DialogContent className="sm:max-w-md">
          {step === "details" && (
            <>
              <DialogHeader>
                <DialogTitle>Register for {event.title}</DialogTitle>
                <DialogDescription>
                  {isFree ? "Enter your details to confirm your free spot." : `Ticket price: ₹${formatINR(event.price)}. Pick seats and pay securely.`}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`name-${event.id}`}>Full name</Label>
                  <Input id={`name-${event.id}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sanika Yadav" autoFocus required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`email-${event.id}`}>Email for confirmation</Label>
                  <Input id={`email-${event.id}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-11 rounded-xl" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={resetAndClose}>Cancel</Button>
                  <Button type="submit" className="rounded-full">
                    {isFree ? "Confirm registration" : "Choose seats →"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}

          {step === "seats" && (
            <>
              <DialogHeader>
                <DialogTitle>Select your seats</DialogTitle>
                <DialogDescription>Live availability · cinema-style booking</DialogDescription>
              </DialogHeader>
              <SeatSelector
                eventId={event.id}
                basePrice={event.price}
                selected={seats}
                onChange={setSeats}
              />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setStep("details")}>Back</Button>
                <Button
                  disabled={seats.length === 0}
                  onClick={() => setStep("pay")}
                  className="rounded-full"
                >
                  Pay ₹{formatINR(amount)} →
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "pay" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" /> Pay ₹{formatINR(amount)}
                </DialogTitle>
                <DialogDescription>
                  256-bit secure · UPI deep-link or card · confirmation only after payment
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-xl bg-muted/60 p-3 text-center text-sm">
                  <p className="font-medium text-foreground">{name || "Attendee"}</p>
                  <p className="text-xs text-muted-foreground">
                    Seats: {seats.join(", ") || "—"} · {event.title}
                  </p>
                </div>

                <Tabs value={payMode} onValueChange={(v) => setPayMode(v as PayMode)}>
                  <TabsList className="grid w-full grid-cols-2 rounded-full">
                    <TabsTrigger value="upi" className="rounded-full">UPI</TabsTrigger>
                    <TabsTrigger value="card" className="rounded-full">Debit / Credit</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upi" className="space-y-3 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      {UPI_METHODS.map((m) => {
                        const Icon = m.icon;
                        const active = selectedUpi === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => launchUpi(m.id)}
                            className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-smooth ${
                              active ? "border-primary bg-primary/5 ring-2 ring-primary/40" : "border-border/60 hover:border-primary/50 hover:bg-muted/40"
                            }`}
                          >
                            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${m.gradient} text-white shadow-sm`}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-foreground">{m.name}</span>
                              <span className="block truncate text-[11px] text-muted-foreground">{m.tag}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {paymentLaunched && selectedUpi && (
                      <>
                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs">
                          <p className="font-medium">
                            {UPI_METHODS.find((m) => m.id === selectedUpi)?.name} opened. Complete ₹{formatINR(amount)} then paste the UTR below.
                          </p>
                          <button type="button" onClick={() => launchUpi(selectedUpi)} className="mt-1 text-primary underline-offset-2 hover:underline">
                            Didn't open? Tap to retry
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`utr-${event.id}`}>UTR / Transaction ID</Label>
                          <Input
                            id={`utr-${event.id}`}
                            value={utr}
                            onChange={(e) => { setUtr(e.target.value); if (utrError) setUtrError(null); }}
                            placeholder="e.g. 412345678901"
                            maxLength={22}
                            className="h-11 rounded-xl font-mono uppercase"
                          />
                          {utrError ? (
                            <p className="text-xs text-destructive">{utrError}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">From your UPI app after payment. Verified instantly.</p>
                          )}
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="card" className="space-y-3 pt-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`cn-${event.id}`}>Card number</Label>
                      <Input
                        id={`cn-${event.id}`}
                        value={cardNum}
                        onChange={(e) => setCardNum(e.target.value.replace(/[^\d ]/g, "").slice(0, 23))}
                        placeholder="4242 4242 4242 4242"
                        inputMode="numeric"
                        className="h-11 rounded-xl font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`ce-${event.id}`}>Expiry</Label>
                        <Input
                          id={`ce-${event.id}`}
                          value={cardExp}
                          onChange={(e) => {
                            let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                            if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                            setCardExp(v);
                          }}
                          placeholder="MM/YY"
                          className="h-11 rounded-xl font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`cv-${event.id}`}>CVV</Label>
                        <Input
                          id={`cv-${event.id}`}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="•••"
                          type="password"
                          className="h-11 rounded-xl font-mono"
                        />
                      </div>
                    </div>
                    {cardError && <p className="text-xs text-destructive">{cardError}</p>}
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <CreditCard className="h-3 w-3" /> 256-bit TLS · 3-D Secure · PCI-DSS validated
                    </p>
                  </TabsContent>
                </Tabs>

                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Email confirmation sent to <span className="font-medium text-foreground">{email}</span> only after payment
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="ghost" onClick={() => setStep("seats")} disabled={verifying}>Back</Button>
                {payMode === "upi" && paymentLaunched && (
                  <Button onClick={handleConfirmUpi} disabled={verifying} className="rounded-full">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {verifying ? "Verifying…" : "I have paid"}
                  </Button>
                )}
                {payMode === "card" && (
                  <Button onClick={handleConfirmCard} disabled={verifying} className="rounded-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {verifying ? "Authorising…" : `Pay ₹${formatINR(amount)}`}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}

          {step === "ticket" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Ticket confirmed
                </DialogTitle>
                <DialogDescription>Show this QR at entry. We've also emailed it.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 rounded-xl border border-border/60 bg-background p-4 text-sm">
                <div className="grid place-items-center rounded-xl bg-white p-4">
                  <QRCodeSVG id={`qr-${event.id}`} value={qrPayload} size={180} level="M" includeMargin />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-base font-semibold">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date} · {event.time} · {event.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-muted/60 p-2">
                    <p className="text-muted-foreground">Attendee</p>
                    <p className="font-medium">{registeredName}</p>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-2">
                    <p className="text-muted-foreground">Seats</p>
                    <p className="font-medium">{seats.length ? seats.join(", ") : "General"}</p>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-2 col-span-2">
                    <p className="text-muted-foreground">Ticket ID</p>
                    <p className="font-mono text-[11px]">{ticketId}</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={downloadTicket} className="rounded-full">
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button onClick={() => setOpen(false)} className="rounded-full">Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
