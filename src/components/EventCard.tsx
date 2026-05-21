import { useState } from "react";
import { Calendar, MapPin, CheckCircle2, IndianRupee, Mail, Smartphone, Wallet, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FriendsAvatars } from "@/components/FriendsAvatars";
import type { EventItem } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import paymentQr from "@/assets/payment-qr.jpeg";

type PayMethod = {
  id: string;
  name: string;
  tag: string;
  gradient: string;
  icon: typeof Smartphone;
  scheme: string; // UPI deep-link scheme for that app
};

const UPI_VPA = "vibetix@upi";
const UPI_PAYEE = "VibeTix Events";

const PAY_METHODS: PayMethod[] = [
  { id: "phonepe", name: "PhonePe", tag: "UPI · Secure", gradient: "from-[#5f259f] to-[#9b59ff]", icon: Smartphone, scheme: "phonepe://pay" },
  { id: "gpay", name: "Google Pay", tag: "UPI · Secure", gradient: "from-[#4285F4] via-[#34A853] to-[#FBBC04]", icon: Wallet, scheme: "tez://upi/pay" },
  { id: "paytm", name: "Paytm", tag: "UPI / Wallet", gradient: "from-[#00b9f1] to-[#002970]", icon: Smartphone, scheme: "paytmmp://pay" },
  { id: "bhim", name: "BHIM UPI", tag: "Any UPI app", gradient: "from-[#ff7a00] to-[#1aa260]", icon: Building2, scheme: "upi://pay" },
];

const buildUpiUrl = (scheme: string, amount: number, note: string, txnId: string) => {
  const params = new URLSearchParams({
    pa: UPI_VPA,
    pn: UPI_PAYEE,
    am: String(amount),
    cu: "INR",
    tn: note,
    tr: txnId,
  });
  return `${scheme}?${params.toString()}`;
};

type Step = "details" | "pay";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

export const EventCard = ({ event }: { event: EventItem }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(
    () => localStorage.getItem("vibetix_user_email") || ""
  );
  const [utr, setUtr] = useState("");
  const [utrError, setUtrError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentLaunched, setPaymentLaunched] = useState(false);
  const [registeredName, setRegisteredName] = useState<string | null>(null);

  const isFree = event.price === 0;

  const resetAndClose = () => {
    setOpen(false);
    setStep("details");
    setUtr("");
    setUtrError(null);
    setSelectedMethod(null);
    setName("");
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isFree) {
      completeRegistration();
    } else {
      setStep("pay");
    }
  };

  const verifyUtr = (value: string): string | null => {
    const v = value.trim().toUpperCase();
    if (!v) return "Enter the UTR / Transaction ID from your UPI app to confirm payment.";
    if (!/^[A-Z0-9]{12,22}$/.test(v)) {
      return "UTR should be 12–22 letters/digits (no spaces).";
    }
    if (/^(.)\1+$/.test(v)) return "That doesn't look like a real UTR.";
    return null;
  };

  const handlePayClick = async () => {
    if (!selectedMethod) {
      toast({
        title: "Choose a payment app",
        description: "Select PhonePe, Google Pay, Paytm or BHIM UPI to continue.",
        variant: "destructive",
      });
      return;
    }
    const err = verifyUtr(utr);
    setUtrError(err);
    if (err) {
      toast({
        title: "Payment not verified",
        description: "Enter the UTR shown in your payment app after paying.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    await new Promise((r) => setTimeout(r, 900));
    setVerifying(false);
    toast({
      title: "Payment verified ✓",
      description: `UTR ${utr.trim().toUpperCase()} matched. Sending confirmation email…`,
    });
    completeRegistration();
  };

  const completeRegistration = () => {
    const trimmed = name.trim();
    setRegisteredName(trimmed);

    // Trigger confirmation email via user's mail client
    if (email.trim()) {
      const subject = encodeURIComponent(`Ticket confirmed: ${event.title}`);
      const body = encodeURIComponent(
        `Hi ${trimmed},\n\nYour booking is confirmed 🎉\n\n` +
          `Event: ${event.title}\nDate: ${event.date} · ${event.time}\n` +
          `Venue: ${event.location}\n` +
          `Amount paid: ${isFree ? "Free" : `₹${formatINR(event.price)}`}\n` +
          (utr.trim() ? `UTR / Txn ID: ${utr.trim().toUpperCase()}\n` : "") +
          `Ticket ID: VTX-${event.id.toUpperCase()}-${trimmed
            .toUpperCase()
            .replace(/\s+/g, "")}\n\nSee you there!\n— VibeTix`
      );
      window.location.href = `mailto:${encodeURIComponent(
        email.trim()
      )}?subject=${subject}&body=${body}`;
    }

    toast({
      title: isFree ? "Registration complete!" : "Payment received 🎉",
      description: email.trim()
        ? `Confirmation sent to ${email.trim()}`
        : `${trimmed} is registered for ${event.title}.`,
    });
    resetAndClose();
  };

  return (
    <Card className="group overflow-hidden border-border/60 bg-gradient-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3 bg-background/80 text-foreground backdrop-blur-md hover:bg-background/80">
          {event.category}
        </Badge>
        <div className="absolute right-3 top-3 flex items-center gap-0.5 rounded-full bg-background/80 px-3 py-1 text-sm font-semibold backdrop-blur-md">
          {isFree ? (
            "Free"
          ) : (
            <>
              <IndianRupee className="h-3.5 w-3.5" />
              {formatINR(event.price)}
            </>
          )}
        </div>
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-lg font-semibold leading-tight">{event.title}</h3>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {event.date} · {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {registeredName && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-foreground">
              Registered as{" "}
              <span className="font-semibold text-primary">{registeredName}</span>
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <FriendsAvatars friends={event.friendsAttending} />
          {registeredName ? (
            <Button size="sm" variant="outline" disabled className="rounded-full">
              Registered
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setStep("details");
                setOpen(true);
              }}
              className="rounded-full"
            >
              {isFree ? "Book" : `Book · ₹${formatINR(event.price)}`}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : resetAndClose())}>
        <DialogContent className="sm:max-w-md">
          {step === "details" ? (
            <>
              <DialogHeader>
                <DialogTitle>Register for {event.title}</DialogTitle>
                <DialogDescription>
                  {isFree
                    ? "Enter your details to confirm your free spot."
                    : `Ticket price: ₹${formatINR(event.price)}. Pay via UPI in the next step.`}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`name-${event.id}`}>Full name</Label>
                  <Input
                    id={`name-${event.id}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sanika Yadav"
                    autoFocus
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`email-${event.id}`}>Email for confirmation</Label>
                  <Input
                    id={`email-${event.id}`}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={resetAndClose}>
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-full">
                    {isFree ? "Confirm registration" : "Continue to payment"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Pay ₹{formatINR(event.price)}
                </DialogTitle>
                <DialogDescription>
                  Choose your payment app to pay securely. No QR scan needed.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-xl bg-muted/60 p-3 text-center text-sm">
                  <p className="font-medium text-foreground">{name || "Attendee"}</p>
                  <p className="text-xs text-muted-foreground">
                    Amount: ₹{formatINR(event.price)} · {event.title}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Pay using
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAY_METHODS.map((m) => {
                      const Icon = m.icon;
                      const active = selectedMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMethod(m.id)}
                          className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-smooth ${
                            active
                              ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                              : "border-border/60 hover:border-primary/50 hover:bg-muted/40"
                          }`}
                        >
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${m.gradient} text-white shadow-sm`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-foreground">
                              {m.name}
                            </span>
                            <span className="block truncate text-[11px] text-muted-foreground">
                              {m.tag}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>


                <div className="space-y-1.5">
                  <Label htmlFor={`utr-${event.id}`}>
                    UTR / Transaction ID{" "}
                    <span className="text-xs font-normal text-destructive">(required)</span>
                  </Label>
                  <Input
                    id={`utr-${event.id}`}
                    value={utr}
                    onChange={(e) => {
                      setUtr(e.target.value);
                      if (utrError) setUtrError(null);
                    }}
                    placeholder="e.g. 412345678901"
                    maxLength={22}
                    autoCapitalize="characters"
                    className="h-11 rounded-xl font-mono uppercase"
                  />
                  {utrError ? (
                    <p className="text-xs text-destructive">{utrError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Found in your UPI app after payment. We'll verify it instantly.
                    </p>
                  )}
                </div>

                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Confirmation will be emailed to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="ghost" onClick={() => setStep("details")} disabled={verifying}>
                  Back
                </Button>
                <Button onClick={handlePayClick} disabled={verifying} className="rounded-full">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {verifying ? "Verifying…" : "I have paid"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
