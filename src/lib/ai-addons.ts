// Mapping of AI addon technical keys to human-readable Russian labels
const AI_ADDON_LABELS: Record<string, string> = {
  eventReminder: "Напоминание о событии",
  weatherCheck: "Проверка погоды",
  parkingInfo: "Информация о парковке",
  dressCodeInfo: "Информация о дресс-коде",
  ageVerification: "Проверка возраста",
  ticketValidation: "Проверка билетов",
  accessibilityInfo: "Доступность для людей с ОВЗ",
  transportationInfo: "Информация о транспорте",
  foodAndDrinksInfo: "Информация о еде и напитках",
  refundPolicy: "Политика возврата",
  waitlist: "Лист ожидания",
  checkInSystem: "Система чек-ина",
  qrCodeTickets: "QR-коды для билетов",
  liveStream: "Онлайн-трансляция",
  recordingAvailable: "Запись будет доступна",
  groupDiscounts: "Групповые скидки",
  earlyBirdTickets: "Ранние билеты (Early Bird)",
  vipAccess: "VIP-доступ",
  networking: "Нетворкинг",
  photoAndVideo: "Фото и видеосъёмка",
  merchandise: "Мерч",
  certificate: "Сертификат участника",
  feedbackForm: "Форма обратной связи",
  sponsorInfo: "Информация о спонсорах",
  covidPolicy: "COVID-политика",
  securityCheck: "Проверка безопасности",
  badgePrinting: "Печать бейджей",
  cloakroom: "Гардероб",
  wifiAccess: "Wi-Fi доступ",
  chargingStations: "Зарядные станции",
  kidsZone: "Детская зона",
  petFriendly: "Можно с питомцами",
  smokingArea: "Место для курения",
  prayerRoom: "Молельная комната",
  firstAid: "Медпункт",
  lostAndFound: "Бюро находок",
  cashlessPayments: "Безналичная оплата",
  multiLanguage: "Мультиязычность",
  signLanguage: "Сурдоперевод",
  subtitles: "Субтитры",
  wheelchairAccessible: "Доступно для колясок",
  nearPublicTransport: "Рядом с общественным транспортом",
};

/**
 * Convert a technical AI addon key to a human-readable Russian label.
 * Falls back to: splitting camelCase → lowercasing → capitalizing first letter.
 */
export function formatAiAddon(addon: string): string {
  const trimmed = addon.trim();
  // Direct mapping
  if (AI_ADDON_LABELS[trimmed]) {
    return AI_ADDON_LABELS[trimmed];
  }
  // Fallback: split camelCase / snake_case / kebab-case
  const spaced = trimmed
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ");
  // Capitalize first letter, lowercase the rest
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}
