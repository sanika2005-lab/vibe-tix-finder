import concert from "@/assets/event-concert.jpg";
import art from "@/assets/event-art.jpg";
import food from "@/assets/event-food.jpg";
import tech from "@/assets/event-tech.jpg";
import club from "@/assets/event-club.jpg";
import comedy from "@/assets/event-comedy.jpg";
import garba from "@/assets/event-garba.jpg";
import holi from "@/assets/event-holi.jpg";
import wedding from "@/assets/event-wedding.jpg";
import diwali from "@/assets/event-diwali.jpg";

export type Friend = {
  id: string;
  name: string;
  avatar: string;
};

export type EventCategory = "Music" | "Art" | "Food" | "Tech" | "Nightlife" | "Comedy" | "Festival" | "Wedding";

export type EventItem = {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  price: number;
  image: string;
  friendsAttending: Friend[];
  description: string;
};

export const friends: Friend[] = [
  { id: "1", name: "Maya", avatar: "https://i.pravatar.cc/100?img=47" },
  { id: "2", name: "Jordan", avatar: "https://i.pravatar.cc/100?img=12" },
  { id: "3", name: "Priya", avatar: "https://i.pravatar.cc/100?img=45" },
  { id: "4", name: "Leo", avatar: "https://i.pravatar.cc/100?img=15" },
  { id: "5", name: "Zoe", avatar: "https://i.pravatar.cc/100?img=49" },
  { id: "6", name: "Sam", avatar: "https://i.pravatar.cc/100?img=33" },
  { id: "7", name: "Ana", avatar: "https://i.pravatar.cc/100?img=44" },
];

export const events: EventItem[] = [
  {
    id: "e1",
    title: "Sunset Sounds Festival",
    category: "Music",
    date: "Sat, May 17",
    time: "6:00 PM",
    location: "Riverside Park, Brooklyn",
    price: 45,
    image: concert,
    friendsAttending: [friends[0], friends[1], friends[2], friends[4]],
    description: "An open-air music festival featuring indie headliners and local acts at sunset.",
  },
  {
    id: "e2",
    title: "Neon Nights: Underground",
    category: "Nightlife",
    date: "Fri, May 23",
    time: "10:00 PM",
    location: "Vault Club, Downtown",
    price: 25,
    image: club,
    friendsAttending: [friends[1], friends[5]],
    description: "Late-night DJ set with laser visuals. 21+. Dress sharp.",
  },
  {
    id: "e3",
    title: "Modern Art Vernissage",
    category: "Art",
    date: "Thu, May 22",
    time: "7:30 PM",
    location: "Atelier 9 Gallery",
    price: 0,
    image: art,
    friendsAttending: [friends[2], friends[6]],
    description: "Opening night for emerging local artists. Wine and conversation.",
  },
  {
    id: "e4",
    title: "Campus Food Truck Fest",
    category: "Food",
    date: "Sun, May 18",
    time: "12:00 PM",
    location: "University Quad",
    price: 10,
    image: food,
    friendsAttending: [friends[0], friends[3], friends[4], friends[5], friends[6]],
    description: "30+ food trucks, live music, string lights, and good vibes.",
  },
  {
    id: "e5",
    title: "Founders & Coffee Meetup",
    category: "Tech",
    date: "Wed, May 28",
    time: "9:00 AM",
    location: "The Hive Coworking",
    price: 15,
    image: tech,
    friendsAttending: [friends[3], friends[5]],
    description: "Casual meetup for early-stage founders. Lightning intros and espresso.",
  },
  {
    id: "e6",
    title: "Stand-Up Under the Stars",
    category: "Comedy",
    date: "Sat, May 31",
    time: "8:30 PM",
    location: "Backyard Theatre",
    price: 18,
    image: comedy,
    friendsAttending: [friends[0], friends[2], friends[6]],
    description: "An intimate night of comedy with rising local comedians.",
  },
  {
    id: "e7",
    title: "Garba Raas Night",
    category: "Festival",
    date: "Sat, Oct 4",
    time: "7:30 PM",
    location: "Sardar Patel Grounds, Ahmedabad",
    price: 20,
    image: garba,
    friendsAttending: [friends[0], friends[2], friends[3], friends[6]],
    description: "Nine nights of Navratri — live dhol, dandiya, and traditional Gujarati flavors.",
  },
  {
    id: "e8",
    title: "Holi Splash Festival",
    category: "Festival",
    date: "Fri, Mar 6",
    time: "11:00 AM",
    location: "Phoenix Lawns, Mumbai",
    price: 12,
    image: holi,
    friendsAttending: [friends[1], friends[4], friends[5]],
    description: "Organic colors, rain dance, bhang thandai, and Bollywood beats all day.",
  },
  {
    id: "e9",
    title: "Sharma–Patel Sangeet & Wedding",
    category: "Wedding",
    date: "Sun, Dec 14",
    time: "6:00 PM",
    location: "The Leela Palace, Udaipur",
    price: 0,
    image: wedding,
    friendsAttending: [friends[0], friends[1], friends[3]],
    description: "Invite-only sangeet followed by a grand baraat and reception. Indian attire requested.",
  },
  {
    id: "e10",
    title: "Diwali Dhamaka Mela",
    category: "Festival",
    date: "Mon, Nov 9",
    time: "5:00 PM",
    location: "Connaught Place, New Delhi",
    price: 8,
    image: diwali,
    friendsAttending: [friends[2], friends[4], friends[5], friends[6]],
    description: "Diyas, rangoli contest, street food stalls and a fireworks finale.",
  },
];

export const myTickets = [events[0], events[3]];

export const recommendations = [
  { event: events[1], by: friends[1] },
  { event: events[4], by: friends[3] },
  { event: events[5], by: friends[2] },
  { event: events[6], by: friends[2] },
  { event: events[8], by: friends[0] },
];

export const categories: EventCategory[] = ["Music", "Art", "Food", "Tech", "Nightlife", "Comedy", "Festival", "Wedding"];
