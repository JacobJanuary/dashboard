import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Lock, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findSystemState } from "@/lib/global-admin-v3";
import { cn } from "@/lib/utils";

const toneClasses = {
  neutral: "bg-[#f8fafc] text-[#475569]",
  good: "bg-[#e9f8ef] text-[#138a4a]",
  warn: "bg-[#fff5dd] text-[#a76100]",
  danger: "bg-[#fff0ef] text-[#c52b20]",
  info: "bg-[#eaf4ff] text-[#0969b9]",
};

export function SystemStateV3({ slug }: { slug: string }) {
  const state = findSystemState(slug);
  const Icon =
    state.tone === "danger" ? AlertTriangle : state.tone === "warn" ? Clock : state.tone === "good" ? CheckCircle2 : state.slug === "offline" ? WifiOff : Lock;

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="admin-page-head p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="outline">{state.id}</Badge>
            <Badge className={cn("border-0", toneClasses[state.tone])}>{state.slug}</Badge>
          </div>
          <h1 className="text-3xl font-bold">{state.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{state.purpose}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Realistic SparkIRL example</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("rounded-2xl border border-border p-5", toneClasses[state.tone])}>
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/70">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold">{state.title}</p>
                    <p className="mt-1 text-sm opacity-80">{state.expectedAction}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-2 rounded-xl bg-white/70 p-3 text-sm">
                  <div className="flex justify-between gap-3"><span>Entity</span><b>Sunset Sessions</b></div>
                  <div className="flex justify-between gap-3"><span>State</span><b>{state.slug}</b></div>
                  <div className="flex justify-between gap-3"><span>System response</span><b>Visible, scoped, auditable</b></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Implementation notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Affected routes</p>
                <div className="mt-2 space-y-2">
                  {state.affectedRoutes.map((route) => (
                    <Link key={route} href={route} className="block rounded-lg border border-border bg-white px-3 py-2 text-sm hover:bg-secondary/60">
                      {route}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audit / permission note</p>
                <p className="mt-2 rounded-lg bg-[#f8fafc] p-3 text-sm text-muted-foreground">{state.auditNote}</p>
              </div>
              <Link href="/admin/states">
                <Button className="w-full">Open global state library</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
