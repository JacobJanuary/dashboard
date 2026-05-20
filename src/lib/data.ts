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
    title: "Закаты @ The Penmar",
    venue: "The Penmar",
    address: "Роуз-авеню, 1233, Венис",
    date: "Сб, 17 апреля",
    time: "18:00",
    endTime: "21:00",
    distance: "2.3 км",
    price: 25,
    currency: "$",
    ageMin: 21,
    category: "Музыка",
    tags: ["Живая музыка", "На открытом воздухе", "Напитки"],
    interested: 47,
    verifiedInterested: 38,
    coverImage: "/demo/events/sunset-mixer.png",
    gallery: [
      "/demo/events/sunset-mixer.png",
      "/demo/events/sunset-mixer.png",
    ],
    description:
      "Патио для одиноких под живую музыку и напитки в час золотого заката. Приходите с друзьями или в одиночку — атмосфера расслабленная, музыка живая, а закат бесплатный.",
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
    title: "Викторина в Hi Tops",
    venue: "Hi Tops Bar",
    address: "Бульвар Санта-Моника, 8933, Вест-Голливуд",
    date: "Вт, 23 марта",
    time: "20:00",
    endTime: "22:00",
    distance: "5.1 км",
    price: 15,
    currency: "$",
    ageMin: 21,
    category: "Игры",
    tags: ["Викторина", "Командные", "Напитки"],
    interested: 63,
    verifiedInterested: 51,
    coverImage: "/demo/events/trivia-night.png",
    gallery: [
      "/demo/events/trivia-night.png",
    ],
    description:
      "Динамичный вечер викторины в дружелюбной атмосфере: команды меняются каждый раунд, а победители получают напитки. Опыт не нужен — берите с собой только ум и улыбку.",
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
    title: "Мастер-класс по керамике при свечах",
    venue: "Bitter Root Studio",
    address: "Хейден-авеню, 3609, Калвер-Сити",
    date: "Пт, 26 марта",
    time: "19:00",
    endTime: "21:30",
    distance: "8.4 км",
    price: 45,
    currency: "$",
    ageMin: 21,
    category: "Мастер-класс",
    tags: ["Творчество", "Практика", "Напитки"],
    interested: 34,
    verifiedInterested: 28,
    coverImage: "/demo/events/ceramics-workshop.png",
    gallery: [
      "/demo/events/ceramics-workshop.png",
    ],
    description:
      "Мастер-класс по керамике при свечах с приветственными напитками и лёгкими закусками. Места меняются для общения — вы создадите что-то руками и, возможно, встретите кого-то сердцем.",
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
    title: "Вводный урок пляжного тенниса",
    venue: "Tower 26",
    address: "Оушен-Фронт-Уок, 2525, Санта-Моника",
    date: "Вс, 29 марта",
    time: "10:00",
    endTime: "12:00",
    distance: "4.2 км",
    price: null,
    currency: "$",
    ageMin: 18,
    category: "Спорт",
    tags: ["Активный отдых", "На открытом воздухе", "Для начинающих"],
    interested: 28,
    verifiedInterested: 22,
    coverImage: "/demo/events/beach-tennis.png",
    gallery: [
      "/demo/events/beach-tennis.png",
    ],
    description:
      "Вводные занятия по пляжному теннису с ротацией команд и уютной зоной отдыха между матчами. Всё оборудование предоставляется — просто приходите готовыми двигаться и знакомиться.",
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
    title: "Happy hour для любителей собак",
    venue: "DogPPL",
    address: "Оушен-Парк-бульвар, 3440, Санта-Моника",
    date: "Вт, 6 апреля",
    time: "17:30",
    endTime: "20:00",
    distance: "3.8 км",
    price: null,
    currency: "$",
    ageMin: 21,
    category: "Лайфстайл",
    tags: ["Собаки", "Общение", "Напитки"],
    interested: 41,
    verifiedInterested: 35,
    coverImage: "/demo/events/dog-happy-hour.png",
    gallery: [
      "/demo/events/dog-happy-hour.png",
    ],
    description:
      "Happy hour, куда можно прийти с собакой: специальная зона для знакомств и первый напиток от нас. Ваш питомец — ваш лучший друг и помощник.",
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
    title: "Весенний вечер для сапфических девушек",
    venue: "La Lola Rooftop",
    address: "Саут-Фигероа-стрит, 1260, Центр Лос-Анджелеса",
    date: "Сб, 24 апреля",
    time: "20:00",
    endTime: "23:00",
    distance: "12.1 км",
    price: 20,
    currency: "$",
    ageMin: 21,
    category: "Идентичность",
    tags: ["Крыша", "Игры", "Комьюнити"],
    interested: 56,
    verifiedInterested: 48,
    coverImage: "/demo/events/rooftop-social.png",
    gallery: [
      "/demo/events/rooftop-social.png",
    ],
    description:
      "Вечер на крыше для лесбиянок и сапфических девушек с играми и ведущими. Безопасно, тепло и по-настоящему волшебно.",
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
