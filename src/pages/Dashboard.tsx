import { useRef, useState } from "react";
import { Search, Sparkles, Ticket as TicketIcon, QrCode, Calendar, MapPin, Camera, Pencil } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { FriendsAvatars } from "@/components/FriendsAvatars";
import { AvatarCropper } from "@/components/AvatarCropper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { categories, events, myTickets, recommendations, friends, EventItem } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");

  const [userName, setUserName] = useState(
    (typeof window !== "undefined" && localStorage.getItem("vibetix_user_name")) || "Maya",
  );
  const [userEmail, setUserEmail] = useState(
    (typeof window !== "undefined" && localStorage.getItem("vibetix_user_email")) || "maya@school.edu",
  );
  const [userCity, setUserCity] = useState(
    (typeof window !== "undefined" && localStorage.getItem("vibetix_user_city")) || "Brooklyn, NY",
  );
  const [userAvatar, setUserAvatar] = useState(
    (typeof window !== "undefined" && localStorage.getItem("vibetix_user_avatar")) || friends[0].avatar,
  );

  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<EventItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const saveProfile = (name: string, email: string, city: string) => {
    setUserName(name); setUserEmail(email); setUserCity(city);
    localStorage.setItem("vibetix_user_name", name);
    localStorage.setItem("vibetix_user_email", email);
    localStorage.setItem("vibetix_user_city", city);
    setEditOpen(false);
    toast({ title: "Profile updated" });
  };

  const filtered = events.filter((e) => {
    const q = query.toLowerCase();
    const matchQ = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q);
    const matchC = activeCat === "All" || e.category === activeCat;
    return matchQ && matchC;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="app" />

      <main className="container py-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Hey {userName} 👋</h1>
            <p className="mt-1 text-muted-foreground">Here's what your circle is up to this week.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events or places…"
              className="h-11 rounded-full pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="rounded-full bg-muted/60 p-1">
            <TabsTrigger value="feed" className="rounded-full">Feed</TabsTrigger>
            <TabsTrigger value="tickets" className="rounded-full">My Tickets</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-full">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-10">
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Recommended by friends</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {recommendations.map(({ event, by }) => (
                  <div key={event.id} className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <img src={by.avatar} alt={by.name} className="h-6 w-6 rounded-full object-cover" />
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{by.name}</span> recommends
                      </p>
                    </div>
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <h2 className="mr-2 text-xl font-semibold">Discover</h2>
                {["All", ...categories].map((c) => (
                  <Button
                    key={c}
                    size="sm"
                    variant={activeCat === c ? "default" : "outline"}
                    onClick={() => setActiveCat(c)}
                    className="rounded-full"
                  >
                    {c}
                  </Button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">No events match your search.</Card>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((e) => <EventCard key={e.id} event={e} />)}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <div className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Your upcoming tickets</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {myTickets.map((t) => (
                <Card key={t.id} className="overflow-hidden border-border/60 bg-gradient-card shadow-card">
                  <div className="flex flex-col sm:flex-row">
                    <img src={t.image} alt={t.title} className="h-48 w-full object-cover sm:h-auto sm:w-40" loading="lazy" />
                    <div className="flex-1 space-y-3 p-5">
                      <Badge variant="secondary" className="rounded-full">{t.category}</Badge>
                      <h3 className="text-lg font-semibold leading-tight">{t.title}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {t.date} · {t.time}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {t.location}</div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/60 pt-3">
                        <div className="grid h-12 w-12 place-items-center rounded-lg bg-foreground/5">
                          <QrCode className="h-7 w-7" />
                        </div>
                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setActiveTicket(t)}>
                          View ticket
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gradient-card p-8 shadow-card">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="group relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-primary/20"
                  aria-label="Change profile photo"
                >
                  <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition-smooth group-hover:opacity-100">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{userName}</h2>
                  <p className="text-muted-foreground">{userEmail} · {userCity}</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Badge variant="secondary" className="rounded-full">Music</Badge>
                    <Badge variant="secondary" className="rounded-full">Food</Badge>
                    <Badge variant="secondary" className="rounded-full">Art</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Your circle</h3>
              <FriendsAvatars friends={friends} max={7} />
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Profile photo cropper */}
      <AvatarCropper
        open={cropOpen}
        imageSrc={rawImage}
        onCancel={() => setCropOpen(false)}
        onCropped={(url) => {
          setUserAvatar(url);
          localStorage.setItem("vibetix_user_avatar", url);
          setCropOpen(false);
          toast({ title: "Profile photo updated" });
        }}
      />

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit your info</DialogTitle>
            <DialogDescription>Update how you appear on VibeTix.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.target as HTMLFormElement;
              saveProfile(
                (f.elements.namedItem("p-name") as HTMLInputElement).value.trim() || userName,
                (f.elements.namedItem("p-email") as HTMLInputElement).value.trim() || userEmail,
                (f.elements.namedItem("p-city") as HTMLInputElement).value.trim() || userCity,
              );
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" name="p-name" defaultValue={userName} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-email">Email</Label>
              <Input id="p-email" name="p-email" type="email" defaultValue={userEmail} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-city">City</Label>
              <Input id="p-city" name="p-city" defaultValue={userCity} className="h-11 rounded-xl" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="rounded-full">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View ticket dialog */}
      <Dialog open={!!activeTicket} onOpenChange={(o) => !o && setActiveTicket(null)}>
        <DialogContent className="max-w-md">
          {activeTicket && (
            <>
              <DialogHeader>
                <DialogTitle>{activeTicket.title}</DialogTitle>
                <DialogDescription>Your VibeTix entry pass</DialogDescription>
              </DialogHeader>
              <img src={activeTicket.image} alt={activeTicket.title} className="h-40 w-full rounded-xl object-cover" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" /> {activeTicket.date} · {activeTicket.time}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {activeTicket.location}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Attendee</p>
                    <p className="font-medium">{userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ticket ID</p>
                    <p className="font-mono text-sm">VTX-{activeTicket.id.toUpperCase()}-{userName.slice(0,3).toUpperCase()}</p>
                  </div>
                </div>
                <div className="grid place-items-center rounded-xl bg-foreground/5 p-6">
                  <QrCode className="h-32 w-32" />
                  <p className="mt-2 text-xs text-muted-foreground">Scan at entrance</p>
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full rounded-full" onClick={() => setActiveTicket(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
