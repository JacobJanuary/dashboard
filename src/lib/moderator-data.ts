export type OrganizerType = "venue_owner" | "venue_organizer" | "independent";
export type HostStatus = "pending" | "approved" | "blocked";

export interface HostRecord {
  id: string;
  name: string;
  email: string;
  type: OrganizerType;
  venueId?: string;
  venueName?: string;
  submittedAt: string;
  registeredAt: string;
  status: HostStatus;
  eventsCount: number;
  rating: number;
  photo: string;
  description: string;
  location: string;
}

export interface ModeratorEvent {
  id: string;
  title: string;
  organizerName: string;
  organizerId: string;
  type: string;
  date: string;
  submittedAt: string;
  status: "pending" | "approved" | "blocked";
  featured: boolean;
  capacity: number;
  price: number;
}

export interface QuestRecord {
  id: string;
  title: string;
  venueName: string;
  createdBy: "moderator" | "venue" | "co_created";
  status: "draft" | "live" | "archived";
  startDate: string;
  endDate: string;
  participants: number;
  completions: number;
  description: string;
}

export const hostRecords: HostRecord[] = [
  {
    id: "h1",
    name: "Dots Cafe",
    email: "hello@dotscafe.sg",
    type: "venue_owner",
    venueName: "Dots Cafe",
    registeredAt: "Янв 2024",
    submittedAt: "Только что",
    status: "pending",
    eventsCount: 0,
    rating: 0,
    photo: "/demo/avatars/avatar-01.png",
    description: "Уютное кафе, проводящее бизнес-завтраки и нетворкинг-мероприятия",
    location: "Orchard, Singapore",
  },
  {
    id: "h2",
    name: "Sarah Chen",
    email: "sarah@flowyoga.sg",
    type: "venue_owner",
    venueName: "Flow Yoga Studio",
    registeredAt: "Мар 2024",
    submittedAt: "15 мин назад",
    status: "pending",
    eventsCount: 0,
    rating: 0,
    photo: "/demo/avatars/avatar-01.png",
    description: "Инструктор по йоге и владелец студии, специализируется на пляжной йоге на закате",
    location: "Sentosa, Singapore",
  },
  {
    id: "h3",
    name: "Alex Rivera",
    email: "alex@running.club",
    type: "independent",
    registeredAt: "Фев 2024",
    submittedAt: "2 ч назад",
    status: "approved",
    eventsCount: 12,
    rating: 4.8,
    photo: "/demo/avatars/avatar-04.png",
    description: "Независимый организатор бегового клуба, специалист по маршрутам Marina Bay",
    location: "Marina Bay, Singapore",
  },
  {
    id: "h4",
    name: "Marina Kitchen",
    email: "events@marinakitchen.sg",
    type: "venue_owner",
    venueName: "Marina Kitchen",
    registeredAt: "Дек 2023",
    submittedAt: "—",
    status: "approved",
    eventsCount: 34,
    rating: 4.6,
    photo: "/demo/avatars/avatar-01.png",
    description: "Ресторан высокого класса, проводящий дегустации вина и кулинарные мастер-классы",
    location: "Raffles Place, Singapore",
  },
  {
    id: "h5",
    name: "James & Co. Events",
    email: "hello@jamesand.co",
    type: "venue_organizer",
    venueName: "The Working Capitol",
    registeredAt: "Ноя 2023",
    submittedAt: "—",
    status: "approved",
    eventsCount: 8,
    rating: 4.2,
    photo: "/demo/avatars/avatar-05.png",
    description: "Организатор корпоративных мероприятий в коворкинге The Working Capitol",
    location: "Keong Saik, Singapore",
  },
  {
    id: "h6",
    name: "Night Owl Bar",
    email: "info@nightowl.sg",
    type: "venue_owner",
    venueName: "Night Owl Bar",
    registeredAt: "Окт 2023",
    submittedAt: "—",
    status: "blocked",
    eventsCount: 2,
    rating: 2.1,
    photo: "/demo/avatars/avatar-01.png",
    description: "Бар с повторяющимися инцидентами безопасности",
    location: "Clarke Quay, Singapore",
  },
];

export const moderatorEvents: ModeratorEvent[] = [
  {
    id: "me1",
    title: "Бизнес-завтрак",
    organizerName: "Dots Cafe",
    organizerId: "h1",
    type: "Нетворкинг",
    date: "Завтра, 8:00",
    submittedAt: "Только что",
    status: "pending",
    featured: false,
    capacity: 30,
    price: 25,
  },
  {
    id: "me2",
    title: "Пляжная йога на закате",
    organizerName: "Sarah Chen",
    organizerId: "h2",
    type: "Мастер-класс",
    date: "Сб, 14 июн · 18:00",
    submittedAt: "15 мин назад",
    status: "pending",
    featured: false,
    capacity: 20,
    price: 30,
  },
  {
    id: "me3",
    title: "Беговой клуб Marina Bay",
    organizerName: "Alex Rivera",
    organizerId: "h3",
    type: "Спорт",
    date: "Каждый вторник · 7:00",
    submittedAt: "—",
    status: "approved",
    featured: true,
    capacity: 50,
    price: 0,
  },
  {
    id: "me4",
    title: "Вечер дегустации вина",
    organizerName: "Marina Kitchen",
    organizerId: "h4",
    type: "Еда и напитки",
    date: "Пт, 13 июн · 19:00",
    submittedAt: "—",
    status: "approved",
    featured: false,
    capacity: 16,
    price: 85,
  },
  {
    id: "me5",
    title: "Караоке допоздна",
    organizerName: "Night Owl Bar",
    organizerId: "h6",
    type: "Музыка",
    date: "Пт, 13 июн · 23:00",
    submittedAt: "—",
    status: "blocked",
    featured: false,
    capacity: 40,
    price: 15,
  },
];

export const questRecords: QuestRecord[] = [
  {
    id: "q1",
    title: "Ночь секретного меню",
    venueName: "Marina Kitchen",
    createdBy: "co_created",
    status: "live",
    startDate: "1 июн 2024",
    endDate: "30 июн 2024",
    participants: 142,
    completions: 38,
    description: "Сфотографируй 3 блюда → приложение откроет секретное дегустационное меню. Скажи бармену кодовое слово «Ember» для особого коктейля.",
  },
  {
    id: "q2",
    title: "Йога-челлендж",
    venueName: "Flow Yoga Studio",
    createdBy: "venue",
    status: "draft",
    startDate: "1 июл 2024",
    endDate: "31 июл 2024",
    participants: 0,
    completions: 0,
    description: "Посети 4 занятия за месяц → открой эксклюзивную утреннюю сессию",
  },
  {
    id: "q3",
    title: "Цель бегового клуба",
    venueName: "Marina Bay",
    createdBy: "moderator",
    status: "live",
    startDate: "1 мая 2024",
    endDate: "Постоянно",
    participants: 89,
    completions: 23,
    description: "Пробеги 10 км → получи значок и приоритет на лимитированные слоты",
  },
];
