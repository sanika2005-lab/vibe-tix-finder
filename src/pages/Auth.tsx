import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Apple, Camera, Github, Mail, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nameInput = form.querySelector<HTMLInputElement>("#name");
    const emailInput = form.querySelector<HTMLInputElement>("#email");
    const displayName =
      nameInput?.value.trim() ||
      emailInput?.value.split("@")[0] ||
      "friend";
    localStorage.setItem("vibetix_user_name", displayName);
    if (avatar) {
      localStorage.setItem("vibetix_user_avatar", avatar);
    } else if (mode === "signup") {
      localStorage.removeItem("vibetix_user_avatar");
    }
    toast({
      title: mode === "signup" ? `Welcome to VibeTix, ${displayName}!` : `Welcome back, ${displayName}!`,
      description: "Loading your feed…",
    });
    setTimeout(() => navigate("/dashboard"), 600);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-vibrant opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-primary opacity-30 blur-3xl" />

      <header className="container flex h-16 items-center justify-between">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
        <Card className="w-full max-w-md border-border/60 bg-card/80 p-8 shadow-elegant backdrop-blur-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signup"
                ? "Discover events your friends love."
                : "Pick up where you left off."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-full" type="button">
              <Apple className="mr-2 h-4 w-4" /> Apple
            </Button>
            <Button variant="outline" className="rounded-full" type="button">
              <Github className="mr-2 h-4 w-4" /> Google
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Maya Chen" required className="h-11 rounded-xl" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@school.edu" required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required className="h-11 rounded-xl" />
            </div>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" placeholder="••••••••" required className="h-11 rounded-xl" />
              </div>
            )}

            <Button type="submit" className="h-11 w-full rounded-full shadow-glow">
              <Mail className="mr-2 h-4 w-4" />
              {mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account? " : "New to VibeTix? "}
            <button
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to home</Link>
          </p>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
