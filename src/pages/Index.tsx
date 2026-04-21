import { Link } from "react-router-dom";
import { ArrowRight, Calendar, QrCode, Share2, Sparkles, Users, Ticket } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/EventCard";
import { events, friends } from "@/data/mockData";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Users,
    title: "See who's going",
    desc: "Discover events your friends are attending or vibing with — no more FOMO.",
  },
  {
    icon: Sparkles,
    title: "Smart recommendations",
    desc: "Curated picks based on your circle, not algorithms guessing in the dark.",
  },
  {
    icon: QrCode,
    title: "Instant mobile tickets",
    desc: "Book in seconds, store QR tickets in-app, scan and go.",
  },
  {
    icon: Share2,
    title: "Share with friends",
    desc: "Send recommendations and roll up to events together.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-50 dark:opacity-70"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/80 to-background" aria-hidden />

        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 animate-fade-in rounded-full border-primary/30 bg-gradient-soft px-4 py-1.5">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Social-first event discovery
            </Badge>
            <h1 className="animate-fade-in-up text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Find events your{" "}
              <span className="text-gradient">friends love</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-lg text-muted-foreground md:text-xl" style={{ animationDelay: "0.1s" }}>
              VibeTix turns your social circle into your event guide. See what's
              trending with your people, book tickets in seconds, and never miss
              the night out everyone's talking about.
            </p>
            <div className="mt-8 flex animate-fade-in-up flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "0.2s" }}>
              <Button asChild size="lg" className="group h-12 rounded-full px-8 text-base shadow-glow">
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="ml-1 h-4 w-4 transition-smooth group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8 text-base">
                <Link to="/dashboard">Explore the app</Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex animate-fade-in items-center justify-center gap-3" style={{ animationDelay: "0.4s" }}>
              <div className="flex -space-x-2">
                {friends.slice(0, 5).map((f) => (
                  <img
                    key={f.id}
                    src={f.avatar}
                    alt={f.name}
                    className="h-8 w-8 rounded-full border-2 border-background object-cover"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">12,400+</span> people vibing this week
              </p>
            </div>
          </div>

          {/* App preview */}
          <div className="relative mx-auto mt-16 max-w-5xl animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-vibrant opacity-20 blur-3xl" />
            <Card className="overflow-hidden border-border/60 bg-card/80 p-4 shadow-elegant backdrop-blur-xl md:p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {events.slice(0, 3).map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold md:text-5xl">Built for the way you actually go out</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Less scrolling, more showing up. Everything you need to discover and
            book the events your circle is hyped about.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="group border-border/60 bg-gradient-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow transition-bounce group-hover:scale-110">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-gradient-soft">
        <div className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold md:text-5xl">From scroll to seat in 3 taps</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Users, step: "01", title: "Connect", desc: "Find your friends and follow their event activity." },
              { icon: Calendar, step: "02", title: "Discover", desc: "Browse a personalized feed of events worth showing up to." },
              { icon: Ticket, step: "03", title: "Book", desc: "Grab tickets instantly. QR codes ready in your pocket." },
            ].map((s) => (
              <Card key={s.step} className="bg-card/60 p-8 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-bold text-muted-foreground/40">{s.step}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold md:text-5xl">Free for fans. Fair for organizers.</h2>
          <p className="mt-4 text-lg text-muted-foreground">No subscriptions, no hidden fees.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <Card className="bg-gradient-card p-8 shadow-card">
            <h3 className="text-2xl font-semibold">For Fans</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-bold">$0</span>
              <span className="text-muted-foreground">/forever</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {["Unlimited event discovery", "Friend feed & recommendations", "QR mobile tickets", "Share with friends"].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary">✓</span>
                  {i}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 w-full rounded-full">
              <Link to="/auth">Sign up free</Link>
            </Button>
          </Card>

          <Card className="relative overflow-hidden border-primary/30 bg-gradient-card p-8 shadow-elegant">
            <div className="absolute right-4 top-4">
              <Badge className="bg-gradient-primary">For Organizers</Badge>
            </div>
            <h3 className="text-2xl font-semibold">Pro</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-bold">3%</span>
              <span className="text-muted-foreground">per ticket</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {["List unlimited events", "Audience insights", "Promoted placements", "Direct payouts"].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary">✓</span>
                  {i}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-8 w-full rounded-full">
              <Link to="/auth">Start hosting</Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <Card className="relative overflow-hidden border-none bg-gradient-vibrant p-12 text-center shadow-elegant md:p-20">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover" }} aria-hidden />
          <div className="relative">
            <h2 className="text-4xl font-bold text-primary-foreground md:text-5xl">Your next night out is one tap away</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/90">
              Join the social way to discover events. Free forever for fans.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8 h-12 rounded-full px-8 text-base">
              <Link to="/auth">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>© 2026 VibeTix. Built for people who actually go out.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-smooth hover:text-foreground">Privacy</a>
            <a href="#" className="transition-smooth hover:text-foreground">Terms</a>
            <a href="#" className="transition-smooth hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
