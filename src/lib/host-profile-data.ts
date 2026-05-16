export type HostRole = "venue_owner" | "independent_organizer" | "curator";

export interface HostSocials {
  instagram?: string;
  website?: string;
}

export interface HostReview {
  id: string;
  eventId: string;
  eventTitle: string;
  authorName: string;
  authorAvatar: string;
  rating: number; // 1-5
  text: string;
  date: string; // "Apr 15, 2026"
}

export interface HostProfile {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  coverPhoto: string;
  videoUrl?: string; // промо-видео профиля
  role: HostRole;
  bio: string;
  verified: boolean; // верифицирован или нет
  socials: HostSocials;
  venueIds: string[]; // пустой если independent
  stats: {
    eventsCount: number;
    totalAttendees: number;
    followers: number;
    avgRating: number;
  };
  reviews: HostReview[];
}

export const hostProfiles: HostProfile[] = [
  {
    id: "org1",
    name: "The Penmar",
    slug: "the-penmar",
    avatar: "/demo/avatars/avatar-01.png",
    coverPhoto: "/demo/events/sunset-mixer.png",
    role: "venue_owner",
    bio: "Семейный ресторан и бар в Венисе с лучшей террасой для заката. Каждую неделю устраиваем живую музыку и вечеринки для знакомств. Приходите одни — уходите вдвоём.",
    verified: true,
    socials: { instagram: "@thepenmar", website: "https://thepenmar.com" },
    venueIds: ["v-penmar"],
    stats: {
      eventsCount: 12,
      totalAttendees: 340,
      followers: 1280,
      avgRating: 4.8,
    },
    reviews: [
      {
        id: "r1",
        eventId: "1",
        eventTitle: "Sunset Sessions @ The Penmar",
        authorName: "Maya Chen",
        authorAvatar: "/demo/avatars/avatar-01.png",
        rating: 5,
        text: "Волшебная атмосфера! Живая музыка, прекрасный закат и очень классные люди. Обязательно приду снова.",
        date: "Apr 18, 2026",
      },
      {
        id: "r2",
        eventId: "1",
        eventTitle: "Sunset Sessions @ The Penmar",
        authorName: "Jordan Blake",
        authorAvatar: "/demo/avatars/avatar-02.png",
        rating: 5,
        text: "Организация на высоте. Бар работает быстро, музыка отличная, народ дружелюбный.",
        date: "Apr 18, 2026",
      },
      {
        id: "r3",
        eventId: "1",
        eventTitle: "Sunset Sessions @ The Penmar",
        authorName: "Alex Rivera",
        authorAvatar: "/demo/avatars/avatar-03.png",
        rating: 4,
        text: "Хороший вайб, но было немного шумно. В целом отличный способ познакомиться.",
        date: "Apr 19, 2026",
      },
    ],
  },
  {
    id: "org2",
    name: "Hi Tops Bar",
    slug: "hi-tops-bar",
    avatar: "/demo/avatars/avatar-01.png",
    coverPhoto: "/demo/events/trivia-night.png",
    role: "venue_owner",
    bio: "Легендарный спорт-бар в Вест-Голливуде. LGBTQ+ friendly. Тривии, караоке, вечеринки и лучшие крылышки в городе. Всегда рады новым знакомствам!",
    verified: true,
    socials: { instagram: "@hitopsbar", website: "https://hitopsbar.com" },
    venueIds: ["v-hitops"],
    stats: {
      eventsCount: 8,
      totalAttendees: 280,
      followers: 950,
      avgRating: 4.6,
    },
    reviews: [
      {
        id: "r4",
        eventId: "2",
        eventTitle: "HiTops Trivia Night",
        authorName: "Sam Taylor",
        authorAvatar: "/demo/avatars/avatar-04.png",
        rating: 5,
        text: "Лучшая тривия в городе! Команды менялись каждый раунд — так легко было познакомиться.",
        date: "Mar 24, 2026",
      },
      {
        id: "r5",
        eventId: "2",
        eventTitle: "HiTops Trivia Night",
        authorName: "Riley Park",
        authorAvatar: "/demo/avatars/avatar-05.png",
        rating: 4,
        text: "Весело, но места быстро заканчиваются. Бронируйте заранее!",
        date: "Mar 24, 2026",
      },
      {
        id: "r6",
        eventId: "2",
        eventTitle: "HiTops Trivia Night",
        authorName: "Casey Morgan",
        authorAvatar: "/demo/avatars/avatar-01.png",
        rating: 5,
        text: "Призовые талоны на напитки — гениально! Отличный повод подойти к кому-то.",
        date: "Mar 25, 2026",
      },
    ],
  },
  {
    id: "org3",
    name: "Bitter Root",
    slug: "bitter-root",
    avatar: "/demo/avatars/avatar-03.png",
    coverPhoto: "/demo/events/ceramics-workshop.png",
    role: "venue_owner",
    bio: "Студия керамики и творческое пространство в Калвер-Сити. Проводим воркшопы, свидания вслепую и групповые занятия. Создавайте красоту руками — и сердцем.",
    verified: true,
    socials: { instagram: "@bitterrootstudio", website: "https://bitterroot.studio" },
    venueIds: ["v-bitterroot"],
    stats: {
      eventsCount: 24,
      totalAttendees: 520,
      followers: 2100,
      avgRating: 4.9,
    },
    reviews: [
      {
        id: "r7",
        eventId: "3",
        eventTitle: "Candlelit Ceramics Workshop",
        authorName: "Emma Wilson",
        authorAvatar: "/demo/avatars/avatar-01.png",
        rating: 5,
        text: "Нереально романтично! Свечи, глина, вино — и новые знакомства. Обожаю эту студию.",
        date: "Mar 27, 2026",
      },
      {
        id: "r8",
        eventId: "3",
        eventTitle: "Candlelit Ceramics Workshop",
        authorName: "Lucas Garcia",
        authorAvatar: "/demo/avatars/avatar-05.png",
        rating: 5,
        text: "Профессиональные мастера, уютная атмосфера. Сделал вазу и познакомился с крутой девушкой.",
        date: "Mar 27, 2026",
      },
      {
        id: "r9",
        eventId: "3",
        eventTitle: "Candlelit Ceramics Workshop",
        authorName: "Sophie Martin",
        authorAvatar: "/demo/avatars/avatar-02.png",
        rating: 5,
        text: "24 события — и каждое уникально. Организаторы настоящие профессионалы.",
        date: "Mar 28, 2026",
      },
    ],
  },
  {
    id: "org4",
    name: "Ola Beach Tennis",
    slug: "ola-beach-tennis",
    avatar: "/demo/avatars/avatar-04.png",
    coverPhoto: "/demo/events/beach-tennis.png",
    role: "independent_organizer",
    bio: "Пляжный теннис — новый способ встречаться. Организуем турниры, уроки и миксы в Санта-Монике. Спорт, солнце и новые друзья. Все уровни приветствуются!",
    verified: false,
    socials: { instagram: "@olabeachtennis" },
    venueIds: [],
    stats: {
      eventsCount: 6,
      totalAttendees: 120,
      followers: 430,
      avgRating: 4.7,
    },
    reviews: [
      {
        id: "r10",
        eventId: "4",
        eventTitle: "Beach Tennis Intro Class",
        authorName: "Noah Brown",
        authorAvatar: "/demo/avatars/avatar-02.png",
        rating: 5,
        text: "Первый раз играл в пляжный теннис — оказалось очень весело! Команды менялись, так что все познакомились.",
        date: "Mar 30, 2026",
      },
      {
        id: "r11",
        eventId: "4",
        eventTitle: "Beach Tennis Intro Class",
        authorName: "Olivia Davis",
        authorAvatar: "/demo/avatars/avatar-03.png",
        rating: 4,
        text: "Хорошая тренировка и классные люди. Но солнце было слишком жарким — берите кепку.",
        date: "Mar 30, 2026",
      },
    ],
  },
  {
    id: "org5",
    name: "DogPPL",
    slug: "dogppl",
    avatar: "/demo/avatars/avatar-05.png",
    coverPhoto: "/demo/events/dog-happy-hour.png",
    role: "venue_owner",
    bio: "Парк для собак и социальный клуб в Санта-Монике. Ваш пёс — ваш лучший друг и лучший wingman. Хеппи-ауры, вечеринки и встречи для владельцев собак.",
    verified: true,
    socials: { instagram: "@dogppl", website: "https://dogppl.com" },
    venueIds: ["v-dogppl"],
    stats: {
      eventsCount: 15,
      totalAttendees: 380,
      followers: 1560,
      avgRating: 4.5,
    },
    reviews: [
      {
        id: "r12",
        eventId: "5",
        eventTitle: "Dog Lovers Happy Hour",
        authorName: "Ethan Wilson",
        authorAvatar: "/demo/avatars/avatar-04.png",
        rating: 5,
        text: "Моя собака нашла друга, а я — отличную компанию для вечера. Идеальная концепция!",
        date: "Apr 7, 2026",
      },
      {
        id: "r13",
        eventId: "5",
        eventTitle: "Dog Lovers Happy Hour",
        authorName: "Ava Johnson",
        authorAvatar: "/demo/avatars/avatar-03.png",
        rating: 4,
        text: "Бесплатный первый напиток и отличная зона для знакомств. Но хотелось бы больше места.",
        date: "Apr 7, 2026",
      },
    ],
  },
  {
    id: "org6",
    name: "Chaotic Singles",
    slug: "chaotic-singles",
    avatar: "/demo/avatars/avatar-02.png",
    coverPhoto: "/demo/events/rooftop-social.png",
    role: "independent_organizer",
    bio: "Кураторы хаотично прекрасных вечеров для одиноких сердец. Специализируемся на инклюзивных вечеринках для LGBTQ+ сообщества. Безопасное пространство, игры, знакомства.",
    verified: false,
    socials: { instagram: "@chaoticsingles" },
    venueIds: [],
    stats: {
      eventsCount: 9,
      totalAttendees: 310,
      followers: 890,
      avgRating: 4.9,
    },
    reviews: [
      {
        id: "r14",
        eventId: "6",
        eventTitle: "Sapphic Spring Fling",
        authorName: "Quinn Lee",
        authorAvatar: "/demo/avatars/avatar-05.png",
        rating: 5,
        text: "Наконец-то безопасное пространство для сапфических знакомств! Всё было волшебно.",
        date: "Apr 25, 2026",
      },
      {
        id: "r15",
        eventId: "6",
        eventTitle: "Sapphic Spring Fling",
        authorName: "Drew Anderson",
        authorAvatar: "/demo/avatars/avatar-01.png",
        rating: 5,
        text: "Игры, коктейли, потрясающий вид с крыши. Организаторы продумали всё до мелочей.",
        date: "Apr 25, 2026",
      },
    ],
  },
  // Venue owners from venue-data.ts
  {
    id: "h7",
    name: "AUM Sound Center",
    slug: "aum-sound-center",
    avatar: "/demo/avatars/avatar-01.png",
    coverPhoto: "/demo/venues/yoga-studio.png",
    role: "venue_owner",
    bio: "Пространство для звуковых практик, медитаций и йоги. Болеры, гонги, кристаллические поющие чаши. Регулярные групповые занятия и ретриты для знакомств через созерцание.",
    verified: true,
    socials: { instagram: "@aumsound", website: "https://aumsound.sg" },
    venueIds: ["v1"],
    stats: {
      eventsCount: 12,
      totalAttendees: 280,
      followers: 760,
      avgRating: 4.9,
    },
    reviews: [
      {
        id: "r16",
        eventId: "v1-e1",
        eventTitle: "Звуковая ванна с медитацией",
        authorName: "Liam Tan",
        authorAvatar: "/demo/avatars/avatar-02.png",
        rating: 5,
        text: "Невероятно глубокий опыт. После сеанса легко завязать разговор с соседом по коврику.",
        date: "Apr 10, 2026",
      },
      {
        id: "r17",
        eventId: "v1-e2",
        eventTitle: "Гонг-терапия для пар",
        authorName: "Sophie Lim",
        authorAvatar: "/demo/avatars/avatar-01.png",
        rating: 5,
        text: "Место обладает особой энергетикой. Всё чисто, уютно, а хозяева очень заботливые.",
        date: "Apr 5, 2026",
      },
    ],
  },
  {
    id: "h1",
    name: "Dots Cafe",
    slug: "dots-cafe",
    avatar: "/demo/avatars/avatar-01.png",
    coverPhoto: "/demo/venues/cafe-networking.png",
    role: "venue_owner",
    bio: "Уютное кафе с залом для мероприятий в районе Orchard. Бизнес-завтраки, воркшопы, нетворкинг и свидания вслепую. Отличный кофе и тёплая атмосфера.",
    verified: true,
    socials: { instagram: "@dotscafe", website: "https://dotscafe.sg" },
    venueIds: ["v2"],
    stats: {
      eventsCount: 4,
      totalAttendees: 95,
      followers: 320,
      avgRating: 4.5,
    },
    reviews: [
      {
        id: "r18",
        eventId: "v2-e1",
        eventTitle: "Нетворкинг-завтрак",
        authorName: "Ryan Wong",
        authorAvatar: "/demo/avatars/avatar-05.png",
        rating: 4,
        text: "Хороший кофе и приятные люди. Отличное место для деловых знакомств.",
        date: "Mar 20, 2026",
      },
    ],
  },
  {
    id: "h2",
    name: "Flow Yoga Studio",
    slug: "flow-yoga-studio",
    avatar: "/demo/avatars/avatar-01.png",
    coverPhoto: "/demo/venues/yoga-studio.png",
    role: "venue_owner",
    bio: "Студия йоги с видом на залив в Сентосе. Занятия для всех уровней — от начинающих до продвинутых. Проводим парную йогу и ретриты для знакомств.",
    verified: true,
    socials: { instagram: "@flowyogasg", website: "https://flowyoga.sg" },
    venueIds: ["v3"],
    stats: {
      eventsCount: 8,
      totalAttendees: 160,
      followers: 540,
      avgRating: 4.8,
    },
    reviews: [
      {
        id: "r19",
        eventId: "v3-e1",
        eventTitle: "Парная йога на закате",
        authorName: "Emma Chen",
        authorAvatar: "/demo/avatars/avatar-01.png",
        rating: 5,
        text: "Вид на залив, профессиональные инструкторы и расслабленная атмосфера. Люблю это место!",
        date: "Apr 2, 2026",
      },
      {
        id: "r20",
        eventId: "v3-e2",
        eventTitle: "Йога-миксер для новичков",
        authorName: "James Koh",
        authorAvatar: "/demo/avatars/avatar-04.png",
        rating: 4,
        text: "Отличный способ познакомиться без давления. После йоги чаепитие с новыми друзьями.",
        date: "Mar 28, 2026",
      },
    ],
  },
  {
    id: "h4",
    name: "Marina Kitchen",
    slug: "marina-kitchen",
    avatar: "/demo/avatars/avatar-01.png",
    coverPhoto: "/demo/venues/patio-restaurant.png",
    role: "venue_owner",
    bio: "Ресторан высокого класса с VIP-залом в Raffles Place. Дегустации, частные мероприятия и свидания вслепую премиум-класса. Сомелье, изысканная кухня, незабываемые вечера.",
    verified: true,
    socials: { instagram: "@marinakitchensg", website: "https://marinakitchen.sg" },
    venueIds: ["v5"],
    stats: {
      eventsCount: 6,
      totalAttendees: 140,
      followers: 680,
      avgRating: 4.7,
    },
    reviews: [
      {
        id: "r21",
        eventId: "v5-e1",
        eventTitle: "Винная дегустация для двоих",
        authorName: "Sarah Ng",
        authorAvatar: "/demo/avatars/avatar-05.png",
        rating: 5,
        text: "Роскошно и романтично. Сомельер подобрал идеальные пары вин. Рекомендую для особого случая.",
        date: "Apr 12, 2026",
      },
    ],
  },
];

// Хелперы

export function getHostProfileById(id: string): HostProfile | undefined {
  return hostProfiles.find((h) => h.id === id);
}

export function getHostProfileBySlug(slug: string): HostProfile | undefined {
  return hostProfiles.find((h) => h.slug === slug);
}

export function getHostProfileByName(name: string): HostProfile | undefined {
  return hostProfiles.find((h) => h.name === name);
}

export function getAllHostProfiles(): HostProfile[] {
  return hostProfiles;
}

// Map event host.name to organizer id (for linking from event detail)
export const hostNameToIdMap: Record<string, string> = {
  "The Penmar": "org1",
  "Hi Tops Bar": "org2",
  "Bitter Root": "org3",
  "Ola Beach Tennis": "org4",
  "DogPPL": "org5",
  "Chaotic Singles": "org6",
};

export function getHostIdByEventHostName(hostName: string): string | undefined {
  return hostNameToIdMap[hostName];
}

export function getHostReviewsByEventId(eventId: string): HostReview[] {
  const reviews: HostReview[] = [];
  for (const host of hostProfiles) {
    for (const review of host.reviews) {
      if (review.eventId === eventId) {
        reviews.push(review);
      }
    }
  }
  return reviews;
}

// Subscribe/follow mock helpers
const FOLLOW_STORAGE_KEY = "sparkirl_followed_hosts";

export function getFollowedHosts(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FOLLOW_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleFollowHost(hostId: string): boolean {
  if (typeof window === "undefined") return false;
  const followed = getFollowedHosts();
  const index = followed.indexOf(hostId);
  if (index >= 0) {
    followed.splice(index, 1);
    localStorage.setItem(FOLLOW_STORAGE_KEY, JSON.stringify(followed));
    return false; // unfollowed
  }
  followed.push(hostId);
  localStorage.setItem(FOLLOW_STORAGE_KEY, JSON.stringify(followed));
  return true; // followed
}

export function isFollowingHost(hostId: string): boolean {
  return getFollowedHosts().includes(hostId);
}
