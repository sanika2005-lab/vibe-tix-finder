import { useState } from "react";
import { Search, Sparkles, Ticket as TicketIcon, QrCode, Calendar, MapPin } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { FriendsAvatars } from "@/components/FriendsAvatars";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { categories, events, myTickets, recommendations, friends } from "@/data/mockData";

const Dashboard = () => {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");
  const userName =
    (typeof window !== "undefined" && localStorage.getItem("vibetix_user_name")) || "Maya";

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
        {/* Greeting */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">
              Hey {userName} 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here's what your circle is up to this week.
            </p>
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

          {/* FEED */}
          <TabsContent value="feed" className="space-y-10">
            {/* Recommendations */}
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

            {/* Categories + grid */}
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
                  {filtered.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          {/* TICKETS */}
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
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> {t.date} · {t.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> {t.location}
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/60 pt-3">
                        <div className="grid h-12 w-12 place-items-center rounded-lg bg-foreground/5">
                          <QrCode className="h-7 w-7" />
                        </div>
                        <Button variant="outline" size="sm" className="rounded-full">View ticket</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* PROFILE */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gradient-card p-8 shadow-card">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <img src={friends[0].avatar} alt={userName} className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/20" />
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{userName}</h2>
                  <p className="text-muted-foreground">maya@school.edu · Brooklyn, NY</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Badge variant="secondary" className="rounded-full">Music</Badge>
                    <Badge variant="secondary" className="rounded-full">Food</Badge>
                    <Badge variant="secondary" className="rounded-full">Art</Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Your circle</h3>
              <FriendsAvatars friends={friends} max={7} />
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
