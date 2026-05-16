export interface CalendarAttendee {
  id: string;
  name: string;
  avatar: string;
  age: number;
  status: "confirmed" | "waitlist" | "cancelled" | "checked_in";
  bookedAt: string;
  phone?: string;
  notes?: string;
  messageThread: CalendarMessage[];
}

export interface CalendarMessage {
  id: string;
  from: "organizer" | "attendee";
  type: "text" | "voice";
  text?: string;
  audioUrl?: string;
  duration?: number;
  transcription?: string;
  sentAt: string;
  read: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  date: string; // YYYY-MM-DD
  time: string;
  durationMin: number;
  capacity: number;
  price: number;
  attendees: CalendarAttendee[];
  color: "primary" | "mint" | "plum" | "amber";
}

const avatars = [
  "/demo/avatars/avatar-01.png",
  "/demo/avatars/avatar-02.png",
  "/demo/avatars/avatar-04.png",
  "/demo/avatars/avatar-05.png",
  "/demo/avatars/avatar-01.png",
  "/demo/avatars/avatar-04.png",
  "/demo/avatars/avatar-05.png",
  "/demo/avatars/avatar-03.png",
];

function makeMessages(fromAttendee: string): CalendarMessage[] {
  return [
    {
      id: `m-${Math.random()}`,
      from: "attendee",
      type: "text",
      text: "Hi! Do I need to bring my own mat?",
      sentAt: "Jun 10, 9:30 AM",
      read: true,
    },
    {
      id: `m-${Math.random()}`,
      from: "organizer",
      type: "text",
      text: "No worries, we provide mats. Just bring water and comfortable clothes!",
      sentAt: "Jun 10, 10:15 AM",
      read: true,
    },
    {
      id: `m-${Math.random()}`,
      from: "attendee",
      type: "text",
      text: "Great, thanks! See you Saturday 🧘‍♀️",
      sentAt: "Jun 10, 10:22 AM",
      read: true,
    },
  ];
}

export const calendarEvents: CalendarEvent[] = [
  {
    id: "ce1",
    title: "Sunrise Beach Yoga",
    type: "Yoga",
    date: "2024-06-15",
    time: "07:00",
    durationMin: 60,
    capacity: 20,
    price: 30,
    color: "mint",
    attendees: [
      {
        id: "a1",
        name: "Emma Watson",
        avatar: avatars[0],
        age: 28,
        status: "confirmed",
        bookedAt: "Jun 8",
        phone: "+65 8123 4567",
        notes: "First timer, prefers gentle flow",
        messageThread: makeMessages("Emma"),
      },
      {
        id: "a2",
        name: "James Chen",
        avatar: avatars[1],
        age: 34,
        status: "confirmed",
        bookedAt: "Jun 9",
        phone: "+65 9123 8765",
        messageThread: [],
      },
      {
        id: "a3",
        name: "Sophie Lim",
        avatar: avatars[2],
        age: 26,
        status: "confirmed",
        bookedAt: "Jun 10",
        phone: "+65 8234 5678",
        messageThread: [],
      },
      {
        id: "a4",
        name: "Daniel Park",
        avatar: avatars[3],
        age: 31,
        status: "confirmed",
        bookedAt: "Jun 11",
        phone: "+65 8345 6789",
        messageThread: [],
      },
      {
        id: "a5",
        name: "Lily Tan",
        avatar: avatars[4],
        age: 29,
        status: "waitlist",
        bookedAt: "Jun 12",
        messageThread: [],
      },
      {
        id: "a6",
        name: "Marcus Ong",
        avatar: avatars[5],
        age: 37,
        status: "cancelled",
        bookedAt: "Jun 5",
        messageThread: [],
      },
    ],
  },
  {
    id: "ce2",
    title: "Vinyasa Flow",
    type: "Yoga",
    date: "2024-06-18",
    time: "18:30",
    durationMin: 75,
    capacity: 15,
    price: 35,
    color: "primary",
    attendees: [
      {
        id: "a7",
        name: "Olivia Ng",
        avatar: avatars[6],
        age: 24,
        status: "confirmed",
        bookedAt: "Jun 10",
        messageThread: [],
      },
      {
        id: "a8",
        name: "Ryan Tan",
        avatar: avatars[7],
        age: 30,
        status: "confirmed",
        bookedAt: "Jun 11",
        messageThread: [],
      },
    ],
  },
  {
    id: "ce3",
    title: "Sunset Meditation",
    type: "Meditation",
    date: "2024-06-22",
    time: "18:00",
    durationMin: 45,
    capacity: 25,
    price: 25,
    color: "plum",
    attendees: [
      {
        id: "a9",
        name: "Chloe Sim",
        avatar: avatars[0],
        age: 27,
        status: "confirmed",
        bookedAt: "Jun 12",
        messageThread: [],
      },
    ],
  },
  {
    id: "ce4",
    title: "Power Yoga",
    type: "Yoga",
    date: "2024-06-15",
    time: "10:00",
    durationMin: 60,
    capacity: 12,
    price: 30,
    color: "amber",
    attendees: [
      {
        id: "a10",
        name: "Kevin Lee",
        avatar: avatars[3],
        age: 32,
        status: "confirmed",
        bookedAt: "Jun 9",
        messageThread: [],
      },
    ],
  },
  {
    id: "ce5",
    title: "Yin & Restore",
    type: "Yoga",
    date: "2024-06-25",
    time: "19:00",
    durationMin: 90,
    capacity: 18,
    price: 40,
    color: "mint",
    attendees: [],
  },
];

// Generate a full month grid (June 2024)
export function getMonthDays(year: number, month: number): { date: string; day: number; isCurrentMonth: boolean }[] {
  const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay(); // 0 = Sunday

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({
      date: `${year}-${String(month).padStart(2, "0")}-${String(prevMonthLastDay - i).padStart(2, "0")}`,
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
    });
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      day: d,
      isCurrentMonth: true,
    });
  }

  // Next month padding to fill 42 cells (6 rows)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({
      date: `${year}-${String(month + 2).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      day: d,
      isCurrentMonth: false,
    });
  }

  return days;
}
