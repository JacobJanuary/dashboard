export type EventPrivacy = "public" | "approval_required";

export interface Event {
  id: string;
  slug: string;
  title: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  endTime: string;
  distance: string;
  price: number | null;
  currency: string;
  ageMin: number;
  category: string;
  tags: string[];
  interested: number;
  verifiedInterested: number;
  coverImage: string;
  gallery: string[];
  description: string;
  host: {
    name: string;
    verified: boolean;
    rating: number;
    eventsCount: number;
    avatar: string;
  };
  identityTags?: string[];
  isRegistered?: boolean;
  status?: "upcoming" | "live" | "ended";
  privacy?: EventPrivacy;
  metaPixelId?: string;
  gtmContainerId?: string;
  zapierWebhookUrl?: string;
  refundProtectionEnabled?: boolean;
  refundProtectionProvider?: string;
  refundProtectionFeePercent?: number;
  digitalTicketsEnabled?: boolean;
}

export interface AttendanceRequest {
  id: string;
  eventId: string;
  userName: string;
  userAvatar: string;
  userAge: number;
  status: "pending" | "approved" | "rejected";
  message?: string;
  requestedAt: string;
}

export interface Attendee {
  id: string;
  name: string;
  age: number;
  avatar: string;
  interests: string[];
  verified: boolean;
  eventId: string;
}

export interface ConnectionPool {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  expiresInDays: number;
  totalAttendees: number;
  attendees: Attendee[];
  myConnections: number;
  isExpired: boolean;
}

export const events: Event[] = [
  {
    id: "1",
    slug: "sunset-sessions-the-penmar",
    title: "Sunset Sessions @ The Penmar",
    venue: "The Penmar",
    address: "1233 Rose Ave, Venice",
    date: "Sat, Apr 17",
    time: "6:00 PM",
    endTime: "9:00 PM",
    distance: "2.3 km",
    price: 25,
    currency: "$",
    ageMin: 21,
    category: "Music",
    tags: ["Live music", "Outdoor", "Drinks"],
    interested: 47,
    verifiedInterested: 38,
    coverImage: "/demo/events/sunset-mixer.png",
    gallery: [
      "/demo/events/sunset-mixer.png",
      "/demo/events/sunset-mixer.png",
    ],
    description:
      "A dedicated singles patio set against live music and golden hour drinks. Bring your friends or come solo — the vibe is relaxed, the music is live, and the sunset is free.",
    host: {
      name: "The Penmar",
      verified: true,
      rating: 4.8,
      eventsCount: 12,
      avatar: "/demo/avatars/avatar-01.png",
    },
    privacy: "public",
    status: "upcoming",
    metaPixelId: "123456789012345",
    gtmContainerId: "GTM-ABC1234",
    refundProtectionEnabled: true,
    refundProtectionProvider: "XCover",
    refundProtectionFeePercent: 5,
    digitalTicketsEnabled: true,
  },
  {
    id: "2",
    slug: "hi-tops-trivia-night",
    title: "HiTops Trivia Night",
    venue: "Hi Tops Bar",
    address: "8933 Santa Monica Blvd, West Hollywood",
    date: "Tue, Mar 23",
    time: "8:00 PM",
    endTime: "10:00 PM",
    distance: "5.1 km",
    price: 15,
    currency: "$",
    ageMin: 21,
    category: "Games",
    tags: ["Trivia", "Teams", "Drinks"],
    interested: 63,
    verifiedInterested: 51,
    coverImage: "/demo/events/trivia-night.png",
    gallery: [
      "/demo/events/trivia-night.png",
    ],
    description:
      "A high-energy, LGBTQ+ friendly trivia night where teams rotate each round and winners score drink tickets. No trivia experience needed — just bring your brain and your smile.",
    host: {
      name: "Hi Tops Bar",
      verified: true,
      rating: 4.6,
      eventsCount: 8,
      avatar: "/demo/avatars/avatar-01.png",
    },
    identityTags: ["LGBTQ+ friendly"],
    privacy: "public",
    status: "ended",
  },
  {
    id: "3",
    slug: "candlelit-ceramics-workshop",
    title: "Candlelit Ceramics Workshop",
    venue: "Bitter Root Studio",
    address: "3609 Hayden Ave, Culver City",
    date: "Fri, Mar 26",
    time: "7:00 PM",
    endTime: "9:30 PM",
    distance: "8.4 km",
    price: 45,
    currency: "$",
    ageMin: 21,
    category: "Workshop",
    tags: ["Creative", "Hands-on", "Drinks"],
    interested: 34,
    verifiedInterested: 28,
    coverImage: "/demo/events/ceramics-workshop.png",
    gallery: [
      "/demo/events/ceramics-workshop.png",
    ],
    description:
      "A candlelit ceramics workshop with welcome drinks, light bites, and seat rotations built for mingling. You'll make something with your hands and maybe meet someone with your heart.",
    host: {
      name: "Bitter Root",
      verified: true,
      rating: 4.9,
      eventsCount: 24,
      avatar: "/demo/avatars/avatar-03.png",
    },
    privacy: "approval_required",
    status: "ended",
  },
  {
    id: "4",
    slug: "beach-tennis-intro-class",
    title: "Beach Tennis Intro Class",
    venue: "Tower 26",
    address: "2525 Ocean Front Walk, Santa Monica",
    date: "Sun, Mar 29",
    time: "10:00 AM",
    endTime: "12:00 PM",
    distance: "4.2 km",
    price: null,
    currency: "$",
    ageMin: 18,
    category: "Sport",
    tags: ["Active", "Outdoor", "Beginner-friendly"],
    interested: 28,
    verifiedInterested: 22,
    coverImage: "/demo/events/beach-tennis.png",
    gallery: [
      "/demo/events/beach-tennis.png",
    ],
    description:
      "Intro beach tennis classes with rotating teams and a shaded SparkIRL lounge between matches. All equipment provided. Just show up ready to move and meet.",
    host: {
      name: "Ola Beach Tennis",
      verified: true,
      rating: 4.7,
      eventsCount: 6,
      avatar: "/demo/avatars/avatar-04.png",
    },
    privacy: "public",
    status: "upcoming",
  },
  {
    id: "5",
    slug: "dog-lovers-happy-hour",
    title: "Dog Lovers Happy Hour",
    venue: "DogPPL",
    address: "3440 Ocean Park Blvd, Santa Monica",
    date: "Tue, Apr 6",
    time: "5:30 PM",
    endTime: "8:00 PM",
    distance: "3.8 km",
    price: null,
    currency: "$",
    ageMin: 21,
    category: "Lifestyle",
    tags: ["Dogs", "Social", "Drinks"],
    interested: 41,
    verifiedInterested: 35,
    coverImage: "/demo/events/dog-happy-hour.png",
    gallery: [
      "/demo/events/dog-happy-hour.png",
    ],
    description:
      "A dog-friendly happy hour featuring a dedicated 'Meet Cute' zone and first drink on us. Your pup is your wingman.",
    host: {
      name: "DogPPL",
      verified: true,
      rating: 4.5,
      eventsCount: 15,
      avatar: "/demo/avatars/avatar-05.png",
    },
    privacy: "public",
    status: "upcoming",
  },
  {
    id: "6",
    slug: "sunset-yoga-santa-monica",
    title: "Sapphic Spring Fling",
    venue: "La Lola Rooftop",
    address: "1260 S Figueroa St, Downtown LA",
    date: "Sat, Apr 24",
    time: "8:00 PM",
    endTime: "11:00 PM",
    distance: "12.1 km",
    price: 20,
    currency: "$",
    ageMin: 21,
    category: "Identity",
    tags: ["Rooftop", "Games", "Community"],
    interested: 56,
    verifiedInterested: 48,
    coverImage: "/demo/events/rooftop-social.png",
    gallery: [
      "/demo/events/rooftop-social.png",
    ],
    description:
      "A rooftop evening for lesbian and sapphic-identifying singles, complete with games and hosted moments. Safe, warm, and absolutely magical.",
    host: {
      name: "Chaotic Singles",
      verified: true,
      rating: 4.9,
      eventsCount: 9,
      avatar: "/demo/avatars/avatar-02.png",
    },
    identityTags: ["Sapphic"],
    privacy: "approval_required",
    status: "upcoming",
  },
];

export const attendees: Attendee[] = [
  { id: "a1", name: "Maya", age: 27, avatar: "/demo/avatars/avatar-01.png", interests: ["Music", "Hiking"], verified: true, eventId: "2" },
  { id: "a2", name: "Jordan", age: 29, avatar: "/demo/avatars/avatar-02.png", interests: ["Trivia", "Comedy"], verified: true, eventId: "2" },
  { id: "a3", name: "Alex", age: 25, avatar: "/demo/avatars/avatar-03.png", interests: ["Games", "Craft Beer"], verified: true, eventId: "2" },
  { id: "a4", name: "Sam", age: 31, avatar: "/demo/avatars/avatar-04.png", interests: ["Trivia", "Movies"], verified: true, eventId: "2" },
  { id: "a5", name: "Riley", age: 26, avatar: "/demo/avatars/avatar-05.png", interests: ["Music", "Yoga"], verified: true, eventId: "2" },
  { id: "a6", name: "Casey", age: 28, avatar: "/demo/avatars/avatar-01.png", interests: ["Comedy", "Hiking"], verified: true, eventId: "2" },
  { id: "a7", name: "Taylor", age: 24, avatar: "/demo/avatars/avatar-02.png", interests: ["Trivia", "Board Games"], verified: true, eventId: "2" },
  { id: "a8", name: "Avery", age: 30, avatar: "/demo/avatars/avatar-03.png", interests: ["Craft Beer", "Live Music"], verified: true, eventId: "2" },
  { id: "a9", name: "Quinn", age: 27, avatar: "/demo/avatars/avatar-05.png", interests: ["Games", "Cooking"], verified: true, eventId: "2" },
  { id: "a10", name: "Drew", age: 32, avatar: "/demo/avatars/avatar-01.png", interests: ["Movies", "Hiking"], verified: true, eventId: "2" },
  
  { id: "b1", name: "Emma", age: 26, avatar: "/demo/avatars/avatar-01.png", interests: ["Ceramics", "Wine"], verified: true, eventId: "3" },
  { id: "b2", name: "Lucas", age: 29, avatar: "/demo/avatars/avatar-05.png", interests: ["Art", "Design"], verified: true, eventId: "3" },
  { id: "b3", name: "Sophie", age: 28, avatar: "/demo/avatars/avatar-02.png", interests: ["Crafts", "Music"], verified: true, eventId: "3" },
  { id: "b4", name: "Noah", age: 31, avatar: "/demo/avatars/avatar-02.png", interests: ["Design", "Photography"], verified: true, eventId: "3" },
  { id: "b5", name: "Olivia", age: 25, avatar: "/demo/avatars/avatar-03.png", interests: ["Wine", "Yoga"], verified: true, eventId: "3" },
  { id: "b6", name: "Ethan", age: 30, avatar: "/demo/avatars/avatar-04.png", interests: ["Art", "Travel"], verified: true, eventId: "3" },
];

export const connectionPools: ConnectionPool[] = [
  {
    eventId: "2",
    eventTitle: "HiTops Trivia Night",
    eventDate: "Mar 23",
    expiresInDays: 5,
    totalAttendees: 10,
    attendees: attendees.filter(a => a.eventId === "2"),
    myConnections: 2,
    isExpired: false,
  },
  {
    eventId: "3",
    eventTitle: "Candlelit Ceramics Workshop",
    eventDate: "Mar 26",
    expiresInDays: 2,
    totalAttendees: 6,
    attendees: attendees.filter(a => a.eventId === "3"),
    myConnections: 0,
    isExpired: false,
  },
];

export const attendanceRequests: AttendanceRequest[] = [
  {
    id: "req1",
    eventId: "6",
    userName: "Maya Chen",
    userAvatar: "/demo/avatars/avatar-01.png",
    userAge: 27,
    status: "pending",
    message: "Очень хочу познакомиться с девушками в безопасной атмосфере!",
    requestedAt: "Apr 20",
  },
  {
    id: "req2",
    eventId: "6",
    userName: "Jordan Blake",
    userAvatar: "/demo/avatars/avatar-02.png",
    userAge: 29,
    status: "pending",
    message: "Первая сапфическая вечеринка, немного волнуюсь но очень рада",
    requestedAt: "Apr 21",
  },
  {
    id: "req3",
    eventId: "6",
    userName: "Alex Rivera",
    userAvatar: "/demo/avatars/avatar-03.png",
    userAge: 25,
    status: "approved",
    message: "",
    requestedAt: "Apr 19",
  },
  {
    id: "req4",
    eventId: "4",
    userName: "Sam Taylor",
    userAvatar: "/demo/avatars/avatar-04.png",
    userAge: 31,
    status: "pending",
    message: "Никогда не играл в пляжный теннис, но очень хочу попробовать!",
    requestedAt: "Mar 25",
  },
  {
    id: "req5",
    eventId: "4",
    userName: "Riley Park",
    userAvatar: "/demo/avatars/avatar-05.png",
    userAge: 26,
    status: "approved",
    message: "",
    requestedAt: "Mar 24",
  },
];

export const filterChips = [
  { label: "Tonight", active: false },
  { label: "This week", active: true },
  { label: "Free", active: false },
  { label: "21+", active: false },
  { label: "LGBTQ+", active: false },
  { label: "Sport", active: false },
  { label: "Workshop", active: false },
  { label: "Music", active: false },
];
