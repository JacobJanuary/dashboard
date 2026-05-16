export interface AttendeeRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "rsvp" | "paid" | "checked_in" | "no_show" | "cancelled";
  ticketType: string;
  registeredAt: string;
  verified: boolean;
  age: number;
  interests: string[];
}

export interface EventStats {
  views: number;
  detailOpens: number;
  favorites: number;
}

export interface GroupMessage {
  type: "text" | "voice";
  text?: string;
  audioUrl?: string;
  duration?: number;
  transcription?: string;
  sentAt: string;
}

export type TicketType = "paid" | "free" | "donation";

export interface Ticket {
  id: string;
  name: string;
  type: TicketType;
  price: number | null; // null for free, min for donation
  quantity: number;
  sold: number;
  salesStart: string;
  salesEnd: string;
  visibility: "public" | "hidden" | "password";
  minPerOrder: number;
  maxPerOrder: number;
  description: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  usageLimit: number | null;
  usedCount: number;
  applicableTickets: string[]; // ticket ids or "all"
  validFrom: string;
  validUntil: string;
}

export interface OrganizerEvent {
  id: string;
  title: string;
  slug: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  sharingDescription: string;
  coverImage: string;
  status: "draft" | "live" | "upcoming" | "completed" | "cancelled";
  rsvpCount: number;
  checkedIn: number;
  capacity: number;
  revenue: number;
  connections: number;
  connectionRate: number;
  category: string;
  eventType: string;
  eventCategory: string;
  eventSubCategory: string;
  keywords: string[];
  currency: string;
  price: number | null;
  soldTickets: number;
  tickets: Ticket[];
  promoCodes: PromoCode[];
  waitlistEnabled: boolean;
  waitlist: { name: string; email: string; joinedAt: string }[];
  coHosts: { id: string; name: string; avatar: string }[];
  stats: EventStats;
  attendees: AttendeeRecord[];
  unreadMessages: number;
  groupMessages: GroupMessage[];
  // Tracking & integrations
  metaPixelId?: string;
  gtmContainerId?: string;
  zapierWebhookUrl?: string;
  // Refund protection
  refundProtectionEnabled: boolean;
  refundProtectionProvider?: string;
  refundProtectionFeePercent?: number;
  // Digital tickets
  digitalTicketsEnabled: boolean;
}

const attendeePool: AttendeeRecord[] = [
  { id: "u1", name: "Maya Chen", email: "maya.c@email.com", avatar: "/demo/avatars/avatar-01.png", status: "paid", ticketType: "General", registeredAt: "Mar 20", verified: true, age: 27, interests: ["Music", "Hiking"] },
  { id: "u2", name: "Jordan Blake", email: "jordan.b@email.com", avatar: "/demo/avatars/avatar-02.png", status: "paid", ticketType: "General", registeredAt: "Mar 21", verified: true, age: 29, interests: ["Trivia", "Comedy"] },
  { id: "u3", name: "Alex Rivera", email: "alex.r@email.com", avatar: "/demo/avatars/avatar-03.png", status: "paid", ticketType: "General", registeredAt: "Mar 19", verified: true, age: 25, interests: ["Games", "Craft Beer"] },
  { id: "u4", name: "Sam Taylor", email: "sam.t@email.com", avatar: "/demo/avatars/avatar-04.png", status: "rsvp", ticketType: "General", registeredAt: "Mar 22", verified: true, age: 31, interests: ["Trivia", "Movies"] },
  { id: "u5", name: "Riley Park", email: "riley.p@email.com", avatar: "/demo/avatars/avatar-05.png", status: "paid", ticketType: "VIP", registeredAt: "Mar 18", verified: true, age: 26, interests: ["Music", "Yoga"] },
  { id: "u6", name: "Casey Morgan", email: "casey.m@email.com", avatar: "/demo/avatars/avatar-01.png", status: "paid", ticketType: "General", registeredAt: "Mar 20", verified: true, age: 28, interests: ["Comedy", "Hiking"] },
  { id: "u7", name: "Taylor Brooks", email: "taylor.b@email.com", avatar: "/demo/avatars/avatar-02.png", status: "paid", ticketType: "General", registeredAt: "Mar 21", verified: true, age: 24, interests: ["Trivia", "Board Games"] },
  { id: "u8", name: "Avery Kim", email: "avery.k@email.com", avatar: "/demo/avatars/avatar-03.png", status: "paid", ticketType: "VIP", registeredAt: "Mar 19", verified: true, age: 30, interests: ["Craft Beer", "Live Music"] },
  { id: "u9", name: "Jamie Liu", email: "jamie.l@email.com", avatar: "/demo/avatars/avatar-04.png", status: "rsvp", ticketType: "General", registeredAt: "Mar 23", verified: false, age: 22, interests: ["Sport", "Beach"] },
  { id: "u10", name: "Drew Patel", email: "drew.p@email.com", avatar: "/demo/avatars/avatar-05.png", status: "rsvp", ticketType: "General", registeredAt: "Mar 24", verified: false, age: 33, interests: ["Dogs", "Lifestyle"] },
];

export const organizerEvents: OrganizerEvent[] = [
  {
    id: "e1",
    title: "Sunset Sessions @ The Penmar",
    slug: "sunset-sessions-the-penmar",
    date: "Apr 17, 2026",
    time: "6:00 PM",
    venue: "The Penmar, Venice",
    description: "Вечер живой музыки на закате с лучшими локальными артистами. Приносите пледы и друзей.",
    sharingDescription: "Живая музыка на закате в The Penmar. Локальные артисты, пледы и хорошее настроение.",
    coverImage: "/demo/events/sunset-mixer.png",
    status: "upcoming",
    rsvpCount: 47,
    checkedIn: 0,
    capacity: 60,
    revenue: 1175,
    connections: 0,
    connectionRate: 0,
    category: "Music",
    eventType: "concertOrPerformance",
    eventCategory: "music",
    eventSubCategory: "Acoustic",
    keywords: ["live music", "sunset", "venice", "local artists"],
    currency: "USD",
    price: 25,
    soldTickets: 42,
    tickets: [
      { id: "t1", name: "General Admission", type: "paid", price: 25, quantity: 50, sold: 42, salesStart: "2026-03-01", salesEnd: "2026-04-16", visibility: "public", minPerOrder: 1, maxPerOrder: 5, description: "" },
      { id: "t2", name: "VIP Early Bird", type: "paid", price: 40, quantity: 10, sold: 10, salesStart: "2026-03-01", salesEnd: "2026-03-31", visibility: "public", minPerOrder: 1, maxPerOrder: 2, description: "Includes priority seating and drink voucher" },
    ],
    promoCodes: [
      { id: "p1", code: "EARLY20", discountType: "percentage", discountValue: 20, usageLimit: 50, usedCount: 12, applicableTickets: ["all"], validFrom: "2026-03-01", validUntil: "2026-03-31" },
    ],
    waitlistEnabled: true,
    waitlist: [],
    coHosts: [],
    stats: { views: 1240, detailOpens: 356, favorites: 89 },
    attendees: attendeePool.slice(0, 7),
    unreadMessages: 2,
    groupMessages: [
      { type: "text", text: "Не забудьте взять пледы, вечером может быть прохладно!", sentAt: "Apr 15, 10:30 AM" },
    ],
    metaPixelId: "",
    gtmContainerId: "",
    zapierWebhookUrl: "",
    refundProtectionEnabled: false,
    digitalTicketsEnabled: false,
  },
  {
    id: "e2",
    title: "HiTops Trivia Night",
    slug: "hitops-trivia-night",
    date: "Mar 23, 2026",
    time: "8:00 PM",
    venue: "HiTops Bar, West Hollywood",
    description: "Еженедельная вечеринка с викториной. Призы для победителей, happy hour до 21:00.",
    sharingDescription: "Викторина в HiTops Bar с призами и happy hour. Проверь свои знания!",
    coverImage: "/demo/events/rooftop-social.png",
    status: "completed",
    rsvpCount: 63,
    checkedIn: 58,
    capacity: 80,
    revenue: 945,
    connections: 14,
    connectionRate: 24,
    category: "Games",
    eventType: "partyOrSocialGathering",
    eventCategory: "hobbiesAndSpecialInterest",
    eventSubCategory: "Board Games",
    keywords: ["trivia", "quiz", "bar", "prizes"],
    currency: "USD",
    price: 15,
    soldTickets: 63,
    tickets: [
      { id: "t3", name: "Standard", type: "paid", price: 15, quantity: 80, sold: 63, salesStart: "2026-02-01", salesEnd: "2026-03-22", visibility: "public", minPerOrder: 1, maxPerOrder: 10, description: "" },
    ],
    promoCodes: [],
    waitlistEnabled: false,
    waitlist: [],
    coHosts: [],
    stats: { views: 2100, detailOpens: 580, favorites: 134 },
    attendees: attendeePool.slice(0, 8),
    unreadMessages: 0,
    groupMessages: [],
    metaPixelId: "",
    gtmContainerId: "",
    zapierWebhookUrl: "",
    refundProtectionEnabled: false,
    digitalTicketsEnabled: false,
  },
  {
    id: "e3",
    title: "Candlelit Ceramics Workshop",
    slug: "candlelit-ceramics-workshop",
    date: "Mar 26, 2026",
    time: "7:00 PM",
    venue: "Clay Studio, Arts District",
    description: "Мастер-класс по керамике при свечах. Все материалы включены, уносите свою работу домой.",
    sharingDescription: "Мастер-класс по керамике при свечах. Все материалы включены — уноси свою работу!",
    coverImage: "/demo/events/ceramics-workshop.png",
    status: "completed",
    rsvpCount: 34,
    checkedIn: 31,
    capacity: 35,
    revenue: 1530,
    connections: 8,
    connectionRate: 26,
    category: "Workshop",
    eventType: "classTrainingOrWorkshop",
    eventCategory: "hobbiesAndSpecialInterest",
    eventSubCategory: "Pottery",
    keywords: ["ceramics", "pottery", "workshop", "arts district"],
    currency: "USD",
    price: 45,
    soldTickets: 34,
    tickets: [
      { id: "t4", name: "Workshop Pass", type: "paid", price: 45, quantity: 35, sold: 34, salesStart: "2026-02-15", salesEnd: "2026-03-25", visibility: "public", minPerOrder: 1, maxPerOrder: 3, description: "All materials included" },
    ],
    promoCodes: [],
    waitlistEnabled: false,
    waitlist: [],
    coHosts: [],
    stats: { views: 890, detailOpens: 245, favorites: 67 },
    attendees: attendeePool.slice(2, 6),
    unreadMessages: 0,
    groupMessages: [],
    metaPixelId: "",
    gtmContainerId: "",
    zapierWebhookUrl: "",
    refundProtectionEnabled: false,
    digitalTicketsEnabled: false,
  },
  {
    id: "e4",
    title: "Beach Tennis Intro Class",
    slug: "beach-tennis-intro-class",
    date: "Apr 29, 2026",
    time: "10:00 AM",
    venue: "Santa Monica Beach Courts",
    description: "Вводный урок по пляжному теннису для новичков. Ракетки и мячи предоставляются.",
    sharingDescription: "Бесплатный вводный урок по пляжному теннису. Ракетки и мячи — мы!",
    coverImage: "/demo/events/beach-tennis.png",
    status: "upcoming",
    rsvpCount: 28,
    checkedIn: 0,
    capacity: 40,
    revenue: 0,
    connections: 0,
    connectionRate: 0,
    category: "Sport",
    eventType: "classTrainingOrWorkshop",
    eventCategory: "sportsAndFitness",
    eventSubCategory: "Tennis",
    keywords: ["beach tennis", "intro", "santa monica", "free"],
    currency: "USD",
    price: null,
    soldTickets: 0,
    tickets: [
      { id: "t5", name: "Free Entry", type: "free", price: null, quantity: 40, sold: 28, salesStart: "2026-04-01", salesEnd: "2026-04-28", visibility: "public", minPerOrder: 1, maxPerOrder: 5, description: "" },
    ],
    promoCodes: [],
    waitlistEnabled: true,
    waitlist: [],
    coHosts: [],
    stats: { views: 560, detailOpens: 180, favorites: 34 },
    attendees: attendeePool.slice(6, 9),
    unreadMessages: 1,
    groupMessages: [],
    metaPixelId: "",
    gtmContainerId: "",
    zapierWebhookUrl: "",
    refundProtectionEnabled: false,
    digitalTicketsEnabled: false,
  },
  {
    id: "e5",
    title: "Dog Lovers Happy Hour",
    slug: "dog-lovers-happy-hour",
    date: "Apr 6, 2026",
    time: "5:30 PM",
    venue: "Bark Park, Silver Lake",
    description: "Happy hour для владельцев собак. Бесплатные угощения для питомцев, скидки на напитки.",
    sharingDescription: "Happy hour для владельцев собак. Угощения для питомцев и скидки на напитки.",
    coverImage: "/demo/events/dog-happy-hour.png",
    status: "upcoming",
    rsvpCount: 41,
    checkedIn: 0,
    capacity: 50,
    revenue: 0,
    connections: 0,
    connectionRate: 0,
    category: "Lifestyle",
    eventType: "partyOrSocialGathering",
    eventCategory: "homeAndLifestyle",
    eventSubCategory: "Pets & Animals",
    keywords: ["dogs", "happy hour", "pets", "silver lake"],
    currency: "USD",
    price: null,
    soldTickets: 0,
    tickets: [
      { id: "t6", name: "Free Entry", type: "free", price: null, quantity: 50, sold: 41, salesStart: "2026-03-15", salesEnd: "2026-04-05", visibility: "public", minPerOrder: 1, maxPerOrder: 5, description: "" },
    ],
    promoCodes: [],
    waitlistEnabled: true,
    waitlist: [],
    coHosts: [],
    stats: { views: 780, detailOpens: 210, favorites: 45 },
    attendees: attendeePool.slice(8, 10),
    unreadMessages: 0,
    groupMessages: [],
    metaPixelId: "",
    gtmContainerId: "",
    zapierWebhookUrl: "",
    refundProtectionEnabled: false,
    digitalTicketsEnabled: false,
  },
];

export const attendeeRecords: AttendeeRecord[] = attendeePool;

export const analyticsData = {
  totalEvents: 12,
  totalAttendees: 412,
  totalRevenue: 8450,
  avgConnectionRate: 22,
  avgRating: 4.7,
  repeatRate: 34,
  noShowRate: 8,
  funnel: {
    impressions: 12500,
    views: 3400,
    interested: 612,
    paid: 412,
    checkedIn: 378,
  },
  demographics: {
    ageGroups: [
      { label: "18-24", value: 28 },
      { label: "25-29", value: 42 },
      { label: "30-34", value: 22 },
      { label: "35+", value: 8 },
    ],
    genderMix: [
      { label: "Women", value: 48 },
      { label: "Men", value: 46 },
      { label: "Non-binary", value: 6 },
    ],
  },
  monthlyRevenue: [
    { month: "Jan", revenue: 1200 },
    { month: "Feb", revenue: 1850 },
    { month: "Mar", revenue: 2475 },
    { month: "Apr", revenue: 1175 },
  ],
};
