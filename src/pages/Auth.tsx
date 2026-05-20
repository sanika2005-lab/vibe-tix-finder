import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Apple, Camera, Mail, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AvatarCropper } from "@/components/AvatarCropper";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.43-1.7 4.2-5.5 4.2-3.31 0-6-2.74-6-6.12s2.69-6.12 6-6.12c1.88 0 3.14.8 3.86 1.49l2.63-2.53C16.86 3.49 14.66 2.5 12 2.5 6.98 2.5 2.92 6.56 2.92 11.58S6.98 20.66 12 20.66c6.92 0 9.5-4.86 9.5-9.34 0-.63-.07-1.11-.16-1.58H12z"/>
  </svg>
);

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const finishLogin = (displayName: string, email?: string) => {
    localStorage.setItem("vibetix_user_name", displayName);
    if (email) localStorage.setItem("vibetix_user_email", email);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nameInput = form.querySelector<HTMLInputElement>("#name");
    const emailInput = form.querySelector<HTMLInputElement>("#email");
    const email = emailInput?.value || "";
    const displayName = nameInput?.value.trim() || email.split("@")[0] || "friend";
    finishLogin(displayName, email);
  };

  const handleSocial = (provider: "Google" | "Apple") => {
    const defaultName = provider === "Google" ? "Google User" : "Apple User";
    const defaultEmail = provider === "Google" ? "user@gmail.com" : "user@icloud.com";
    const entered = window.prompt(`Enter your ${provider} account name`, "");
    const displayName = (entered && entered.trim()) || defaultName;
    const emailGuess = entered && entered.trim()
      ? `${entered.trim().toLowerCase().replace(/\s+/g, ".")}@${provider === "Google" ? "gmail.com" : "icloud.com"}`
      : defaultEmail;
    toast({ title: `Continuing with ${provider}…`, description: `Signing in as ${displayName}` });
    finishLogin(displayName, emailGuess);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
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
              {mode === "signup" ? "Discover events your friends love." : "Pick up where you left off."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-full" type="button" onClick={() => handleSocial("Apple")}>
              <Apple className="mr-2 h-4 w-4" /> Apple
            </Button>
            <Button variant="outline" className="rounded-full" type="button" onClick={() => handleSocial("Google")}>
              <GoogleIcon /> <span className="ml-2">Google</span>
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative h-20 w-20 overflow-hidden rounded-full bg-muted ring-2 ring-border transition-smooth hover:ring-primary"
                    aria-label="Upload profile picture"
                  >
                    {avatar ? (
                      <img src={avatar} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-muted-foreground">
                        <Camera className="h-6 w-6" />
                      </div>
                    )}
                    <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-smooth group-hover:opacity-100">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <p className="text-xs text-muted-foreground">
                    {avatar ? "Tap to change or recrop" : "Add a profile photo"}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Maya Chen" required className="h-11 rounded-xl" />
                </div>
              </>
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

      <AvatarCropper
        open={cropOpen}
        imageSrc={rawImage}
        onCancel={() => setCropOpen(false)}
        onCropped={(url) => {
          setAvatar(url);
          setCropOpen(false);
          toast({ title: "Photo updated", description: "Looking sharp!" });
        }}
      />
    </div>
  );
};

export default Auth;
