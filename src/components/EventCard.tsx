import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FriendsAvatars } from "@/components/FriendsAvatars";
import type { EventItem } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export const EventCard = ({ event }: { event: EventItem }) => {
  const { toast } = useToast();

  const handleBook = () => {
    toast({
      title: "Ticket booked!",
      description: `${event.title} added to My Tickets.`,
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

        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <FriendsAvatars friends={event.friendsAttending} />
          <Button size="sm" onClick={handleBook} className="rounded-full">
            Book
          </Button>
        </div>
      </div>
    </Card>
  );
};
