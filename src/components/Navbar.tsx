import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export const Navbar = ({ variant = "landing" }: { variant?: "landing" | "app" }) => {
  const location = useLocation();
  const isApp = variant === "app";

  const appLinks = [
    { to: "/dashboard", label: "Feed" },
    { to: "/dashboard?tab=tickets", label: "My Tickets" },
    { to: "/dashboard?tab=profile", label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {isApp
            ? appLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-sm font-medium transition-smooth hover:text-foreground ${
                    location.pathname + location.search === l.to
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              ))
            : (
              <>
                <a href="#features" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">Features</a>
                <a href="#how" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">How it works</a>
                <a href="#pricing" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">Pricing</a>
              </>
            )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isApp ? (
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/">Sign out</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex">
                <Link to="/auth">Log in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full">
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
