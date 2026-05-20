"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  MessageSquare,
  Ticket,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminVenues } from "@/lib/admin-data";
import { events } from "@/lib/data";
import { demoEventCovers, demoVenueCover } from "@/lib/demo-assets";
import { getVenueById, venues } from "@/lib/venue-data";
import { cn } from "@/lib/utils";

function findEvent(id: string) {
  return events.find((event) => event.id === id || event.slug === id) ?? events[0];
}

function findVenue(id: string) {
  const appVenue = getVenueById(id) ?? venues.find((venue) => venue.slug === id);
  if (appVenue) {
    return {
      id: appVenue.id,
      name: appVenue.name,
      address: appVenue.address,
      description: appVenue.description,
      capacity: appVenue.capacity ?? 40,
      rating: appVenue.rating,
      coverPhoto: appVenue.coverPhoto,
      amenities: appVenue.amenities,
      rules: appVenue.rules,
      accessibility: appVenue.aiKnowledge.accessibility,
      policy: "Approve organizers",
    };
  }
  const adminVenue = adminVenues.find((venue) => venue.id === id);
  const adminVenueIndex = Math.max(0, adminVenues.findIndex((venue) => venue.id === id));
  return {
    id: adminVenue?.id ?? id,
    name: adminVenue?.name ?? "Venue not found",
    address: adminVenue?.address ?? "Unknown address",
    description: adminVenue
      ? `${adminVenue.name} public venue profile with access policy, rules and venue AI disclosure.`
      : "This venue could not be loaded.",
    capacity: adminVenue?.capacity ?? 0,
    rating: adminVenue?.rating ?? 0,
    coverPhoto: demoVenueCover(adminVenueIndex),
    amenities: adminVenue?.amenities ?? [],
    rules: adminVenue?.rules ?? [],
    accessibility: adminVenue?.accessibility.join(", ") ?? "Not provided",
    policy: adminVenue?.policy.mode ?? "unknown",
  };
}

function PublicShell({
  children,
  mobile,
}: {
  children: React.ReactNode;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <main className="min-h-screen bg-[#111827] px-4 py-8">
        <div className="mx-auto max-w-[390px] overflow-hidden rounded-[2rem] bg-background shadow-2xl">
          {children}
        </div>
      </main>
    );
  }
  return <main className="min-h-screen bg-[#f5f7fb] px-4 py-8">{children}</main>;
}

function EventSummary({ id }: { id: string }) {
  const event = findEvent(id);
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-white p-3">
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
        <Image src={event.coverImage || demoEventCovers.sunsetMixer} alt={event.title} fill className="object-cover" sizes="96px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{event.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{event.date} · {event.time}</p>
        <p className="mt-1 text-sm text-muted-foreground">{event.venue}</p>
      </div>
    </div>
  );
}

export function PublicVenuePage({ id, mobile }: { id: string; mobile?: boolean }) {
  const venue = findVenue(id);
  return (
    <PublicShell mobile={mobile}>
      <div className={cn("mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-sm", mobile && "rounded-none shadow-none")}>
        <div className="relative h-72">
          <Image src={venue.coverPhoto} alt={venue.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          <div className="absolute bottom-0 p-5 text-white">
            <Badge className="mb-3 border-0 bg-white/20 text-white backdrop-blur">Venue profile</Badge>
            <h1 className="text-3xl font-bold">{venue.name}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/90"><MapPin className="h-4 w-4" />{venue.address}</p>
          </div>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-muted-foreground">{venue.description}</p>
            <Card className="border border-border shadow-none">
              <CardHeader><CardTitle className="text-base">Rules and amenities</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <InfoList title="Amenities" items={venue.amenities} />
                <InfoList title="Rules" items={venue.rules} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-3">
            <MetricRow label="Capacity" value={`${venue.capacity}`} />
            <MetricRow label="Rating" value={`${venue.rating}`} />
            <MetricRow label="Access policy" value={venue.policy} />
            <MetricRow label="Accessibility" value={venue.accessibility} />
            <Link href="/organizer/venues/find"><Button className="w-full">Request venue access</Button></Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

export function EventCheckoutPage({ id }: { id: string }) {
  const event = findEvent(id);
  const [quantity, setQuantity] = useState(1);
  const total = (event.price ?? 0) * quantity;
  return (
    <PublicShell>
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_360px]">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Оформление билета</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <EventSummary id={id} />
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="font-semibold">Общий вход</p>
              <p className="mt-1 text-sm text-muted-foreground">Включает чат события, QR-билет и защиту покупки.</p>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>+</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Order summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <MetricRow label="Tickets" value={`${quantity}`} />
            <MetricRow label="Subtotal" value={`$${total}`} />
            <MetricRow label="Fees" value="$3" />
            <Link href={`/event/${event.id}/confirmation`}><Button className="w-full gap-2"><CreditCard className="h-4 w-4" /> Подтвердить заказ</Button></Link>
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  );
}

export function EventConfirmationPage({ id }: { id: string }) {
  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
            <h1 className="mt-4 text-2xl font-bold">You are confirmed</h1>
            <p className="mt-2 text-sm text-muted-foreground">Билет, приглашение в календарь и доступ к чату готовы.</p>
          </CardContent>
        </Card>
        <EventSummary id={id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href={`/ticket/demo-${id}`}><Button className="w-full gap-2"><Ticket className="h-4 w-4" /> View ticket</Button></Link>
          <Link href={`/event/${id}/chat`}><Button variant="outline" className="w-full gap-2"><MessageSquare className="h-4 w-4" /> Open chat</Button></Link>
        </div>
      </div>
    </PublicShell>
  );
}

export function EventNotFoundRecoveryPage() {
  return (
    <PublicShell>
      <StateCard title="Event not found" text="The event may be private, archived, cancelled or the link is wrong." icon="error" ctaHref="/" cta="Explore events" />
    </PublicShell>
  );
}

export function PreviewMissingFieldsPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl space-y-4">
        <StateCard title="Preview missing fields" text="Public preview cannot be approved because required fields are missing." icon="error" />
        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-3 p-4">
            {["Refund policy missing", "Venue address not verified", "AI disclosure not visible", "Broken organizer profile link"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  );
}

export function EventChangedNotificationPage() {
  return (
    <PublicShell>
      <StateCard title="Event changed" text="The organizer changed schedule details. Confirm you can still attend before the deadline." icon="warn" ctaHref="/event/1" cta="Review event" />
    </PublicShell>
  );
}

export function EventWaitlistPage({ id }: { id: string }) {
  const [joined, setJoined] = useState(false);
  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl space-y-4">
        <EventSummary id={id} />
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <Users className="h-9 w-9 text-[#3949d7]" />
            <h1 className="mt-4 text-2xl font-bold">Join waitlist</h1>
            <p className="mt-2 text-sm text-muted-foreground">You will be notified if a seat opens. Waitlist order is first-in, first-released.</p>
            <Button className="mt-5 w-full" disabled={joined} onClick={() => setJoined(true)}>
              {joined ? "Waitlist joined" : "Join waitlist"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  );
}

export function OrderRefundPage({ id }: { id: string }) {
  const [reason, setReason] = useState("");
  const submitted = reason.length > 3;
  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Refund requested flow</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <MetricRow label="Order" value={id} />
            <MetricRow label="Policy window" value="Eligible until 24h before event" />
            <textarea className="h-28 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm" placeholder="Reason for refund request" value={reason} onChange={(event) => setReason(event.target.value)} />
            <Button className="w-full" disabled={!submitted}>{submitted ? "Refund request ready" : "Enter reason to submit"}</Button>
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  );
}

export function PublicChatEntryPage({ id, aiDisclosure }: { id: string; aiDisclosure?: boolean }) {
  const messages = useMemo(
    () => [
      ["left", "Welcome to the event chat. Be kind, verified and on-topic."],
      ["right", "Is parking available near the venue?"],
      ["left", "AI draft: Parking is available nearby. Organizer will confirm if anything changes."],
    ],
    [],
  );
  return (
    <PublicShell>
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <EventSummary id={id} />
            <div className="mt-4 rounded-xl border border-border bg-[#eaf4ff] p-3 text-sm text-[#0969b9]">
              Public chat opens only for confirmed participants. Reports go to moderator evidence flow.
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>{aiDisclosure ? "AI Reply Disclosure" : "Public Chat Entry"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {messages.map(([side, text]) => (
              <div key={text} className={cn("max-w-[82%] rounded-2xl p-3 text-sm", side === "right" ? "ml-auto bg-[#111827] text-white" : "bg-[#f1f5f9]")}>{text}</div>
            ))}
            {aiDisclosure && (
              <div className="rounded-2xl border border-[#a5f3fc] bg-[#ecfeff] p-4 text-sm text-[#155e75]">
                <Bot className="mb-2 h-5 w-5" />
                AI may draft answers using organizer and venue knowledge. Low-confidence, refund, safety and policy questions require human review.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-semibold">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length ? items.map((item) => <Badge key={item} variant="secondary">{item}</Badge>) : <Badge variant="secondary">No data</Badge>}
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <b>{value}</b>
    </div>
  );
}

function StateCard({
  title,
  text,
  icon,
  ctaHref,
  cta,
}: {
  title: string;
  text: string;
  icon: "error" | "warn";
  ctaHref?: string;
  cta?: string;
}) {
  const Icon = icon === "error" ? AlertTriangle : Clock;
  return (
    <Card className="mx-auto max-w-2xl border-0 shadow-sm">
      <CardContent className="p-6 text-center">
        <Icon className={cn("mx-auto h-14 w-14", icon === "error" ? "text-red-600" : "text-amber-600")} />
        <h1 className="mt-4 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
        {ctaHref && cta && (
          <Link href={ctaHref}>
            <Button className="mt-5">{cta}</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
