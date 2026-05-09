import { useState } from "react";
import { Calendar, MapPin, CheckCircle2 } from "lucide-react";
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

export const EventCard = ({ event }: { event: EventItem }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [registeredName, setRegisteredName] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setRegisteredName(trimmed);
    setOpen(false);
    setName("");
    toast({
      title: "Registration complete!",
      description: `${trimmed} is registered for ${event.title}.`,
    });
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
        <div className="absolute right-3 top-3 rounded-full bg-background/80 px-3 py-1 text-sm font-semibold backdrop-blur-md">
          {event.price === 0 ? "Free" : `$${event.price}`}
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
            <Button size="sm" onClick={() => setOpen(true)} className="rounded-full">
              Book
            </Button>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
            <DialogDescription>
              Enter your full name as it should appear on the ticket.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor={`name-${event.id}`}>Full name</Label>
              <Input
                id={`name-${event.id}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                autoFocus
                required
                className="h-11 rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full">
                Confirm registration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
