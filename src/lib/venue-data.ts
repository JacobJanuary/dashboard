export interface Venue {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  address: string;
  area: string;
  photos: string[];
  coverPhoto: string;
  amenities: string[];
  rules: string[];
  ownerId: string | null; // null = независимое (pre-scraped Google Maps)
  source: "google_maps" | "manual";
  eventsCount: number;
  rating: number;
  reviewCount: number;
  website?: string;
  phone?: string;
  capacity?: number;
  // AI knowledge specific to venue
  aiKnowledge: {
    parking: string;
    transit: string;
    accessibility: string;
    nearby: string;
  };
}

export const venues: Venue[] = [
  {
    id: "v1",
    name: "AUM Sound Center",
    slug: "aum-sound-center",
    description:
      "Пространство для звуковых практик, медитаций и йоги. Болеры, гонги, кристаллические поющие чаши. Подходит для групп до 40 человек.",
    location: "Tiong Bahru, Singapore",
    address: "78 Yong Siak St, #02-01, Singapore 163078",
    area: "Tiong Bahru",
    photos: [
      "/demo/venues/yoga-studio.png",
      "/demo/venues/yoga-studio.png",
    ],
    coverPhoto: "/demo/venues/yoga-studio.png",
    amenities: ["Звуковая система", "Коврики", "Чайная зона", "Душ", "WiFi"],
    rules: [
      "Тишина за 10 минут до начала",
      "Телефоны на беззвучном",
      "Без обуви в зале",
    ],
    ownerId: "h7",
    source: "manual",
    eventsCount: 12,
    rating: 4.9,
    reviewCount: 87,
    website: "https://aumsound.sg",
    phone: "+65 6123 4567",
    capacity: 40,
    aiKnowledge: {
      parking: "Парковка по соседству на Yong Siak St, $2/час. Бесплатно после 18:00.",
      transit: "MRT Tiong Bahru (Exit B), 5 мин пешком. Автобус 123 остановка Yong Siak St.",
      accessibility: "Лифт на 2-й этаж. Доступно для колясок.",
      nearby: "Рядом кафе Forty Hands и Tiong Bahru Bakery — отлично после практики.",
    },
  },
  {
    id: "v2",
    name: "Dots Cafe",
    slug: "dots-cafe",
    description:
      "Уютное кафе с залом для мероприятий до 30 человек. Идеально для бизнес-завтраков, воркшопов и нетворкинга.",
    location: "Orchard, Singapore",
    address: "14 Scotts Rd, #01-02, Singapore 228213",
    area: "Orchard",
    photos: [
      "/demo/venues/cafe-networking.png",
      "/demo/venues/cafe-networking.png",
    ],
    coverPhoto: "/demo/venues/cafe-networking.png",
    amenities: ["Проектор", "WiFi", "Кофе-брейк", "Кондиционер"],
    rules: [
      "Минимальный заказ $15/чел",
      "Бронь зала за 48ч",
      "Без алкоголя после 20:00",
    ],
    ownerId: "h1",
    source: "manual",
    eventsCount: 4,
    rating: 4.5,
    reviewCount: 34,
    capacity: 30,
    aiKnowledge: {
      parking: "ION Orchard парковка, $3/час. Вход со стороны Scotts Rd.",
      transit: "MRT Orchard (Exit 4), прямо у выхода.",
      accessibility: "Вход с уровня земли. Широкие двери.",
      nearby: "ION Orchard, Wheelock Place — шопинг до/после мероприятия.",
    },
  },
  {
    id: "v3",
    name: "Flow Yoga Studio",
    slug: "flow-yoga-studio",
    description:
      "Студия йоги с видом на залив. Занятия для всех уровней — от начинающих до продвинутых. Аренда для индивидуальных тренеров.",
    location: "Sentosa, Singapore",
    address: "8 Sentosa Gateway, #B1-05, Singapore 098269",
    area: "Sentosa",
    photos: [
      "/demo/venues/yoga-studio.png",
      "/demo/venues/yoga-studio.png",
    ],
    coverPhoto: "/demo/venues/yoga-studio.png",
    amenities: ["Коврики", "Блоки", "Душ", "Туалет", "WiFi", "Чай"],
    rules: [
      "Приходить за 10 минут",
      "Без телефонов в зале",
      "Отмена за 12 часов",
    ],
    ownerId: "h2",
    source: "manual",
    eventsCount: 8,
    rating: 4.8,
    reviewCount: 56,
    capacity: 20,
    aiKnowledge: {
      parking: "Sentosa Beach Carpark (Blk 8), $1.20/час до 18:00. Бесплатно вечером.",
      transit: "Sentosa Express до станции Beach, 3 мин пешком.",
      accessibility: "Рампы на входе. Лифт до B1.",
      nearby: "Sentosa Beach, Tanjong Beach Club — можно искупаться после класса.",
    },
  },
  {
    id: "v4",
    name: "The Working Capitol",
    slug: "the-working-capitol",
    description:
      "Коворкинг и ивент-пространство в историческом здании. Конференц-залы на 50-100 человек.",
    location: "Keong Saik, Singapore",
    address: "1 Keong Saik Rd, Singapore 089109",
    area: "Keong Saik",
    photos: [
      "/demo/venues/gallery-loft.png",
      "/demo/venues/gallery-loft.png",
    ],
    coverPhoto: "/demo/venues/gallery-loft.png",
    amenities: ["Проектор", "Микрофон", "WiFi", "Кухня", "Переговорки"],
    rules: [
      "Бронь минимум за 72ч",
      "Аренда от 3 часов",
      "Уборка включена",
    ],
    ownerId: null,
    source: "google_maps",
    eventsCount: 3,
    rating: 4.6,
    reviewCount: 29,
    capacity: 100,
    aiKnowledge: {
      parking: "Уличная парковка по соседству. Outram Park MRT — 7 мин.",
      transit: "Outram Park MRT (EW/NE линии), Exit H. 7 мин пешком.",
      accessibility: "Вход с небольшой лестницей. Лифт внутри.",
      nearby: "Keong Saik Rd — лучшие бары и рестораны Сингапура.",
    },
  },
  {
    id: "v5",
    name: "Marina Kitchen",
    slug: "marina-kitchen",
    description:
      "Ресторан высокого класса с VIP-залом для дегустаций и частных мероприятий.",
    location: "Raffles Place, Singapore",
    address: "10 Marina Blvd, #01-05, Singapore 018983",
    area: "Raffles Place",
    photos: [
      "/demo/venues/patio-restaurant.png",
    ],
    coverPhoto: "/demo/venues/patio-restaurant.png",
    amenities: ["VIP-зал", "Проектор", "WiFi", "Парковщик", "Sommelier"],
    rules: [
      "Дресс-код: smart casual",
      "Минимум 8 гостей для брони зала",
      "Депозит 50% при бронировании",
    ],
    ownerId: "h4",
    source: "manual",
    eventsCount: 6,
    rating: 4.7,
    reviewCount: 42,
    capacity: 50,
    aiKnowledge: {
      parking: "Marina Bay Financial Centre парковка, $4/час. Валет-паркинг доступен.",
      transit: "Downtown MRT (DT линия), Exit C. 3 мин пешком.",
      accessibility: "Полностью доступно для колясок.",
      nearby: "Marina Bay Sands, Gardens by the Bay — в 5 минутах.",
    },
  },
];

// Категории для Google Maps pre-scraped venues
export const venueCategories = [
  "Кафе",
  "Коворкинг",
  "Студия йоги",
  "Бар",
  "Ресторан",
  "Галерея",
  "Парк",
  "Пляж",
  "Концертный зал",
  "Культурный центр",
];

export function getVenueById(id: string): Venue | undefined {
  return getAllVenues().find((v) => v.id === id);
}

export function getVenuesByOwner(ownerId: string): Venue[] {
  return getAllVenues().filter((v) => v.ownerId === ownerId);
}

export function getIndependentVenues(): Venue[] {
  return getAllVenues().filter((v) => v.source === "google_maps" || v.ownerId === null);
}

export function getAllVenueOptions() {
  return getAllVenues().map((v) => ({
    id: v.id,
    name: v.name,
    area: v.area,
    photo: v.coverPhoto,
    ownerId: v.ownerId,
    source: v.source,
  }));
}

// --- User-added venues via localStorage ---

const USER_VENUES_KEY = "sparkirl_user_venues";

function getUserVenues(): Venue[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_VENUES_KEY);
    return raw ? (JSON.parse(raw) as Venue[]) : [];
  } catch {
    return [];
  }
}

/** All venues = mock data + user-added from localStorage */
export function getAllVenues(): Venue[] {
  if (typeof window === "undefined") return venues;
  return [...venues, ...getUserVenues()];
}

/** Venues owned by a specific user (mock + added) */
export function getVenuesByOwnerWithAdded(ownerId: string): Venue[] {
  return getAllVenues().filter((v) => v.ownerId === ownerId);
}

/** Add a new venue and persist to localStorage */
export function addVenue(venue: Venue): void {
  if (typeof window === "undefined") return;
  const current = getUserVenues();
  current.push(venue);
  localStorage.setItem(USER_VENUES_KEY, JSON.stringify(current));
}

/** Remove a user-added venue */
export function removeUserVenue(venueId: string): void {
  if (typeof window === "undefined") return;
  const current = getUserVenues().filter((v) => v.id !== venueId);
  localStorage.setItem(USER_VENUES_KEY, JSON.stringify(current));
}

/** Update a user-added venue */
export function updateUserVenue(venueId: string, updates: Partial<Venue>): void {
  if (typeof window === "undefined") return;
  const current = getUserVenues().map((v) =>
    v.id === venueId ? { ...v, ...updates } : v
  );
  localStorage.setItem(USER_VENUES_KEY, JSON.stringify(current));
}
