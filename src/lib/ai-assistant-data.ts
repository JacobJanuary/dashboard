export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  uploadedAt: string;
  charCount: number;
  scope: "organizer" | "event";
  eventId?: string;
  eventTitle?: string;
}

export interface AiPersona {
  name: string;
  greeting: string;
  tone: "friendly" | "professional" | "zen";
  avatar: string;
}

export interface AiConversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  source: "app" | "website" | "instagram";
  eventId?: string;
  messages: AiMessage[];
  startedAt: string;
  lastActive: string;
  converted: boolean;
}

export interface AiMessage {
  id: string;
  from: "ai" | "user" | "organizer";
  type: "text" | "voice";
  text?: string;
  audioUrl?: string;
  duration?: number;
  transcription?: string;
  sentAt: string;
}

export const aiPersona: AiPersona = {
  name: "Аша",
  greeting:
    "Привет! Я Аша, виртуальный помощник Сары. Спросите меня о занятиях по йоге — расписание, что взять с собой, цены или какой класс подойдёт именно вам! 🧘‍♀️",
  tone: "friendly",
  avatar: "/demo/avatars/avatar-01.png",
};

// Общая база знаний организатора (авто-наследуется всеми событиями)
export const organizerKnowledgeBase: KnowledgeDoc[] = [
  {
    id: "kb1",
    title: "Расписание и цены",
    content:
      "Sunrise Beach Yoga: Пн/Ср/Пт 7:00, $30. Vinyasa Flow: Вт/Чт 18:30, $35. Yin & Restore: Сб 19:00, $40. Power Yoga: Вс 10:00, $30. Все занятия 60–90 минут.",
    uploadedAt: "15 мая 2024",
    charCount: 187,
    scope: "organizer",
  },
  {
    id: "kb2",
    title: "Что взять с собой (FAQ)",
    content:
      "Мы предоставляем коврики, блоки и ремни. Возьмите воду, полотенце и удобную одежду. Для пляжных классов рекомендуем солнцезащитный крем. Опыт не требуется для начальных классов.",
    uploadedAt: "20 мая 2024",
    charCount: 210,
    scope: "organizer",
  },
  {
    id: "kb3",
    title: "Политика отмены",
    content:
      "Бесплатная отмена за 12 часов до класса. Поздняя отмена — штраф 50%. Неявка — полная стоимость. Студенты из листа ожидания получают приоритет при освобождении мест.",
    uploadedAt: "1 июня 2024",
    charCount: 165,
    scope: "organizer",
  },
  {
    id: "kb4",
    title: "Индивидуальные и корпоративные занятия",
    content:
      "Индивидуальные занятия — $120/час. Корпоративные пакеты от $500 для группы из 10 человек. Бронирование: sarah@flowyoga.sg",
    uploadedAt: "3 июня 2024",
    charCount: 145,
    scope: "organizer",
  },
];

// Дополнения к конкретным событиям (переопределяют/дополняют общую базу)
export const eventKnowledgeAddons: KnowledgeDoc[] = [
  {
    id: "kbe1",
    title: "Специальный гость",
    content:
      "В это субботнее занятие приглашён мастер дыхательных практик Рахул из Индии. Будет специальная сегмент на пранаяму.",
    uploadedAt: "10 июня 2024",
    charCount: 98,
    scope: "event",
    eventId: "ce3",
    eventTitle: "Sunset Meditation",
  },
  {
    id: "kbe2",
    title: "Перенос из-за дождя",
    content:
      "Прогноз обещает дождь. Этот класс переносим в крытый зал студии (Orchard Rd, #03-15). Уведомление отправляем за 1 час.",
    uploadedAt: "14 июня 2024",
    charCount: 85,
    scope: "event",
    eventId: "ce1",
    eventTitle: "Sunrise Beach Yoga",
  },
];

export const aiConversations: AiConversation[] = [
  {
    id: "conv1",
    participantName: "Michelle K.",
    participantAvatar: "/demo/avatars/avatar-05.png",
    source: "app",
    eventId: "ce1",
    startedAt: "12 июня, 14:15",
    lastActive: "12 июня, 14:22",
    converted: true,
    messages: [
      { type: "text", id: "cm1",
        from: "user",
        text: "Привет! Я никогда не занималась йогой. Занятие на рассвете подходит для начинающих?",
        sentAt: "14:15",
      },
      { type: "text", id: "cm2",
        from: "ai",
        text: "Конечно! Sunrise Beach Yoga идеально для начинающих. Сара строит поток мягко и доступно. Опыт не нужен — мы всё предоставляем. Показать расписание?",
        sentAt: "14:16",
      },
      { type: "text", id: "cm3",
        from: "user",
        text: "Да, пожалуйста! И что взять с собой?",
        sentAt: "14:18",
      },
      { type: "text", id: "cm4",
        from: "ai",
        text: "Мы даём коврики, блоки и ремни. Возьмите воду, полотенце и крем от солнца для пляжа. Классы Пн/Ср/Пт в 7:00 за $30. Забронировать место?",
        sentAt: "14:19",
      },
      { type: "text", id: "cm5",
        from: "user",
        text: "Запишите меня на эту пятницу!",
        sentAt: "14:20",
      },
      { type: "text", id: "cm6",
        from: "ai",
        text: "Готово! Вы записаны на пятницу 14 июня в 7:00. Увидимся на пляже! 🌅",
        sentAt: "14:21",
      },
    ],
  },
  {
    id: "conv2",
    participantName: "David R.",
    participantAvatar: "/demo/avatars/avatar-02.png",
    source: "instagram",
    startedAt: "11 июня, 10:30",
    lastActive: "11 июня, 10:45",
    converted: false,
    messages: [
      { type: "text", id: "cm7",
        from: "user",
        text: "Есть корпоративные пакеты?",
        sentAt: "10:30",
      },
      { type: "text", id: "cm8",
        from: "ai",
        text: "Да! Корпоративные пакеты от $500 для групп от 10 человек. Сара может приехать к вам в офис или принять в студии. Связать вас напрямую с ней для индивидуального предложения?",
        sentAt: "10:31",
      },
      { type: "text", id: "cm9",
        from: "user",
        text: "Да, на 25 человек",
        sentAt: "10:35",
      },
      { type: "text", id: "cm10",
        from: "ai",
        text: "Отлично! Я передал запрос Саре. Она свяжется с вами в течение 24 часов с предложением для 25 человек. На какой email вам удобно?",
        sentAt: "10:36",
      },
      { type: "text", id: "cm11",
        from: "user",
        text: "david@company.sg",
        sentAt: "10:40",
      },
      { type: "text", id: "cm12",
        from: "organizer",
        text: "Привет, Дэвид! Это Сара. Хотела бы организовать велнес-сессию для вашей команды. Ищете разовое мероприятие или регулярную программу?",
        sentAt: "10:45",
      },
    ],
  },
  {
    id: "conv3",
    participantName: "Anna T.",
    participantAvatar: "/demo/avatars/avatar-01.png",
    source: "website",
    startedAt: "10 июня, 20:00",
    lastActive: "10 июня, 20:08",
    converted: true,
    messages: [
      { type: "text", id: "cm13",
        from: "user",
        text: "Можно отменить, если пойдёт дождь?",
        sentAt: "20:00",
      },
      { type: "text", id: "cm14",
        from: "ai",
        text: "Пляжные классы переносятся в крытый зал при дожде — отмена не нужна! Вы получите уведомление за 1 час, если изменится локация.",
        sentAt: "20:01",
      },
      { type: "text", id: "cm15",
        from: "user",
        text: "Отлично, записываюсь",
        sentAt: "20:08",
      },
    ],
  },
  {
    id: "conv4",
    participantName: "Jason M.",
    participantAvatar: "/demo/avatars/avatar-05.png",
    source: "app",
    startedAt: "13 июня, 11:00",
    lastActive: "13 июня, 11:05",
    converted: false,
    messages: [
      { type: "text", id: "cm16",
        from: "user",
        text: "На пляже есть парковка?",
        sentAt: "11:00",
      },
      { type: "text", id: "cm17",
        from: "ai",
        text: "Да! Общественная парковка Sentosa Beach (Blk 8) — в 7:00 там полно мест. До нашей точки 2 минуты пешком. До 8:00 действуют утренние тарифы.",
        sentAt: "11:01",
      },
    ],
  },
];
