export function generateICS({
  title,
  description,
  location,
  startDate,
  startTime,
  endDate,
  endTime,
}: {
  title: string;
  description: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
}): string {
  const formatDate = (date: string, time: string, addHours = 0): string => {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const d = new Date(year, month - 1, day, hour + addHours, minute);
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const start = formatDate(startDate, startTime);
  const end = formatDate(endDate || startDate, endTime || startTime, 2);

  const uid = `${Date.now()}@sparkirl.com`;
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const escape = (str: string) =>
    str
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SparkIRL//Events//EN",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escape(title)}`,
    `DESCRIPTION:${escape(description)}`,
    `LOCATION:${escape(location)}`,
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadICS(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
