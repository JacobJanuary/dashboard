import { QRCodeSVG } from "qrcode.react";
import { Calendar, Clock, MapPin, User, Ticket } from "lucide-react";
import { events } from "@/lib/data";

export function generateStaticParams() {
  return [
    { id: "demo-1" },
    { id: "demo-2" },
    { id: "demo-3" },
  ];
}

const demoTickets: Record<string, { eventId: string; attendeeName: string; ticketType: string; orderId: string }> = {
  "demo-1": { eventId: "1", attendeeName: "Maya Chen", ticketType: "Общий вход", orderId: "ORD-2026-001" },
  "demo-2": { eventId: "1", attendeeName: "Jordan Blake", ticketType: "VIP ранний доступ", orderId: "ORD-2026-002" },
  "demo-3": { eventId: "2", attendeeName: "Alex Rivera", ticketType: "Стандартный", orderId: "ORD-2026-003" },
};

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = rawId.replace(/\.html$/, "");
  const ticket = demoTickets[id];
  const event = ticket ? events.find((e) => e.id === ticket.eventId) : null;

  if (!ticket || !event) {
    return (
      <div className="flex items-center justify-center h-screen bg-cream">
        <p className="text-muted-foreground">Билет не найден</p>
      </div>
    );
  }

  const qrData = JSON.stringify({
    ticketId: id,
    orderId: ticket.orderId,
    eventId: event.id,
    attendee: ticket.attendeeName,
  });

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-ink p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="text-cream font-bold text-lg">SparkIRL</span>
          </div>
          <p className="text-cream/60 text-xs uppercase tracking-widest">Электронный билет</p>
        </div>

        {/* Event Info */}
        <div className="p-6 space-y-4">
          <h1 className="text-xl font-bold text-ink text-center leading-tight">{event.title}</h1>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 shrink-0 text-primary" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 shrink-0 text-primary" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0 text-primary" />
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <User className="w-4 h-4 shrink-0 text-primary" />
              <span>{ticket.attendeeName}</span>
            </div>
          </div>

          {/* Ticket Type Badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {ticket.ticketType}
            </span>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-border">
              <QRCodeSVG
                value={qrData}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Сканируйте при входе</p>
          </div>

          {/* Order ID */}
          <div className="text-center pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Номер заказа</p>
            <p className="text-sm font-mono text-ink">{ticket.orderId}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-cream/50 p-4 text-center">
          <p className="text-[10px] text-muted-foreground">
            Предъявите этот билет на входе. Скриншоты принимаются.
          </p>
        </div>
      </div>
    </div>
  );
}
