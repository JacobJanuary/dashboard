"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Layers3,
  Lock,
  Route,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditLogPanel, ApprovalTracker, OperationalStatesPanel, StatusBadge } from "./admin-ui";
import {
  dataSourceHealth,
  findSystemState,
  getAllV3Routes,
  getManifestCounts,
  globalNotifications,
  globalScreens,
  handoffChecklist,
  mergeAuditLogs,
  previewQaResults,
  rbacRows,
  searchIndex,
  systemStates,
} from "@/lib/global-admin-v3";
import { adminEvents, roleBasePaths, roleLabels } from "@/lib/admin-data";
import { readSharedAuditEntries } from "@/lib/shared-audit";
import type { AdminRole, AuditLogEntry } from "@/lib/admin-types";
import { cn } from "@/lib/utils";

const navIcons = [ShieldCheck, Layers3, Bell, Search, Smartphone, Lock, ClipboardCheck, Route, Database];

function slugFromParts(parts?: string[]) {
  return parts?.join("/") || "select-role";
}

function AdminGlobalShell({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden bg-[#111827] p-5 text-[#e5e7eb] lg:block">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6471ff,#15c781)]">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold">SparkIRL Admin QA</p>
              <p className="text-xs text-[#a6adba]">Global governance, not a role</p>
            </div>
          </div>
          <nav className="space-y-1">
            {globalScreens.map((screen, index) => {
              const Icon = navIcons[index % navIcons.length];
              const active = screen.route.endsWith(slug);
              return (
                <Link
                  key={screen.id}
                  href={screen.route}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                    active ? "bg-white text-[#111827]" : "text-[#cbd5e1] hover:bg-white/[0.08] hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="min-w-0 flex-1 truncate">{screen.title}</span>
                  <span className="font-mono text-[10px] opacity-70">{screen.id}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-[1600px] space-y-6">
            <div className="admin-page-head flex flex-col gap-4 p-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge className="border-0 bg-[#eef2ff] text-[#3949d7]">Global QA</Badge>
                  <Badge variant="outline">204 route inventory</Badge>
                </div>
                <h1 className="text-2xl font-bold">Admin correctness console</h1>
                <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                  Shared governance surfaces for route coverage, preview QA, RBAC, audit and reusable system states.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["organizer", "venue_owner", "moderator"] as AdminRole[]).map((role) => (
                  <Link key={role} href={roleBasePaths[role]}>
                    <Button variant="outline" size="sm">{roleLabels[role]}</Button>
                  </Link>
                ))}
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function GlobalAdminV3({ slugParts }: { slugParts?: string[] }) {
  const slug = slugFromParts(slugParts);
  const [sharedAudit, setSharedAudit] = useState<AuditLogEntry[]>([]);
  const [searchRole, setSearchRole] = useState<AdminRole>("moderator");
  const counts = useMemo(() => getManifestCounts(), []);
  const totalRoutes = useMemo(() => getAllV3Routes().length, []);

  useEffect(() => {
    setSharedAudit(readSharedAuditEntries());
  }, []);

  return (
    <AdminGlobalShell slug={slug}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {counts.slice(0, 4).map((item) => (
          <Card key={item.group} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-[26px] font-bold leading-none">{item.count}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {slug === "select-role" && <RoleSelector totalRoutes={totalRoutes} />}
      {slug === "shell" && <ShellGuardView />}
      {slug === "notifications" && <NotificationsView />}
      {slug === "search" && <SearchView searchRole={searchRole} setSearchRole={setSearchRole} />}
      {slug === "preview-qa" && <PreviewQaView />}
      {slug === "rbac-matrix" && <RbacMatrixView />}
      {slug === "audit" && <AuditLogPanel logs={mergeAuditLogs(sharedAudit)} />}
      {slug === "approval-model" && <ApprovalModelView />}
      {slug === "data-health" && <DataHealthView />}
      {slug === "design-system" && <DesignSystemView />}
      {slug === "handoff" && <HandoffView totalRoutes={totalRoutes} />}
      {slug === "states" && <StatesLibraryView />}
    </AdminGlobalShell>
  );
}

function RoleSelector({ totalRoutes }: { totalRoutes: number }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Role & Organization Switcher</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {(["organizer", "venue_owner", "moderator"] as AdminRole[]).map((role) => (
            <Link key={role} href={roleBasePaths[role]} className="rounded-2xl border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-lg font-bold">{roleLabels[role]}</p>
              <p className="mt-2 text-sm text-muted-foreground">Open scoped console with explicit permissions.</p>
              <Badge className="mt-4 border-0 bg-[#eaf4ff] text-[#0969b9]">{roleBasePaths[role]}</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Route inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold">{totalRoutes}</p>
          <p className="mt-2 text-sm text-muted-foreground">v3 routes covered by the QA manifest.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ShellGuardView() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <OperationalStatesPanel permissionRole="moderator" partialData />
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>Permission guard behavior</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <BoundaryRow action="Wrong role route" result="Permission denied state, no fake affordance" />
          <BoundaryRow action="Owner reads participant chat" result="Privacy boundary instead of thread" />
          <BoundaryRow action="Moderator opens broad finance" result="Denied unless fraud/dispute context" />
          <BoundaryRow action="Organizer publish before gates" result="Blocked until required gates pass" />
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsView() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle>Global Notifications Center</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {globalNotifications.map((item) => (
          <div key={item.title} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-3">
            <Bell className="h-4 w-4 text-[#0969b9]" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.route}</p>
            </div>
            <Badge variant="outline">{roleLabels[item.role]}</Badge>
            {item.allowed ? (
              <Link href={item.route}><Button size="sm">Open</Button></Link>
            ) : (
              <Badge className="border-0 bg-[#fff0ef] text-[#c52b20]">Restricted</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SearchView({
  searchRole,
  setSearchRole,
}: {
  searchRole: AdminRole;
  setSearchRole: (role: AdminRole) => void;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Universal Search</CardTitle>
          <div className="flex gap-2">
            {(["organizer", "venue_owner", "moderator"] as AdminRole[]).map((role) => (
              <Button key={role} size="sm" variant={searchRole === role ? "default" : "outline"} onClick={() => setSearchRole(role)}>
                {roleLabels[role]}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-[#f8fafc] px-3 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          Search events, venues, participants, cases, payouts...
        </div>
        {searchIndex.map((item) => {
          const allowed = item.allowedRoles.includes(searchRole);
          return (
            <div key={`${item.type}-${item.label}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-3">
              <Badge variant="outline">{item.type}</Badge>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.note}</p>
              </div>
              {allowed ? <Link href={item.route}><Button size="sm">Open</Button></Link> : <Badge className="border-0 bg-[#fff0ef] text-[#c52b20]">Permission denied</Badge>}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function PreviewQaView() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle>Public Preview QA Console</CardTitle></CardHeader>
      <CardContent className="grid gap-3 xl:grid-cols-2">
        {previewQaResults.map((item) => (
          <Link key={item.route} href={item.route} className="rounded-xl border border-border bg-white p-4 transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.entity}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.surface} · {item.route}</p>
              </div>
              <Badge className={cn("border-0", item.status === "pass" ? "bg-[#e9f8ef] text-[#138a4a]" : item.status === "warn" ? "bg-[#fff5dd] text-[#a76100]" : "bg-[#fff0ef] text-[#c52b20]")}>
                {item.status}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{item.note}</p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function RbacMatrixView() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle>RBAC Matrix</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr><th className="py-2">Action</th><th>Organizer</th><th>Venue Owner</th><th>Moderator</th></tr>
          </thead>
          <tbody>
            {rbacRows.map((row) => (
              <tr key={row.action} className="border-t border-border">
                <td className="py-3 font-medium">{row.label}</td>
                <td><BoolBadge value={row.organizer} /></td>
                <td><BoolBadge value={row.venue_owner} /></td>
                <td><BoolBadge value={row.moderator} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function ApprovalModelView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
      <ApprovalTracker event={adminEvents[0]} />
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>Publication derivation</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Event publication is never a single flat approval status. It is derived from venue and platform gates.</p>
          <BoundaryRow action="Venue owner decision" result="Mutates venue gate only" />
          <BoundaryRow action="Moderator decision" result="Mutates platform gate only" />
          <BoundaryRow action="Organizer publish" result="Allowed only after all required gates pass" />
        </CardContent>
      </Card>
    </div>
  );
}

function DataHealthView() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle>Data Freshness & Source Health</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {dataSourceHealth.map((item) => (
          <div key={item.source} className="grid gap-2 rounded-xl border border-border bg-white p-3 md:grid-cols-[160px_120px_1fr_160px] md:items-center">
            <p className="font-semibold">{item.source}</p>
            <StatusBadge value={item.freshness} type="plain" />
            <p className="text-sm text-muted-foreground">{item.note}</p>
            <Link href={item.route}><Button variant="outline" size="sm">Inspect</Button></Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DesignSystemView() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="font-semibold">Status badges</p><div className="mt-3 flex flex-wrap gap-2"><StatusBadge value="pending" /><StatusBadge value="approved" /><StatusBadge value="rejected" /></div></CardContent></Card>
      <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="font-semibold">Decision panel rules</p><p className="mt-2 text-sm text-muted-foreground">Sensitive decisions require reason, policy and evidence where relevant.</p></CardContent></Card>
      <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="font-semibold">Tables and drawers</p><p className="mt-2 text-sm text-muted-foreground">Dense desktop/tablet admin layout with compact rows and detail surfaces.</p></CardContent></Card>
    </div>
  );
}

function HandoffView({ totalRoutes }: { totalRoutes: number }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle>Engineering Handoff Checklist</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <BoundaryRow action="Total manifest routes" result={`${totalRoutes} concrete v3 routes`} />
        {handoffChecklist.map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3">
            {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4 text-amber-600" />}
            <p className="flex-1 font-medium">{item.label}</p>
            <Badge variant={item.done ? "default" : "secondary"}>{item.done ? "Ready" : "Backend TODO"}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StatesLibraryView() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {systemStates.map((state) => (
        <Link key={state.id} href={`/states/${state.slug}`} className="rounded-xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <Badge variant="outline">{state.id}</Badge>
          <p className="mt-3 font-semibold">{state.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{state.purpose}</p>
        </Link>
      ))}
      <Card className="border-0 shadow-sm md:col-span-2 xl:col-span-3">
        <CardContent className="p-4">
          <BoundaryRow action="Example selected" result={findSystemState("gate-conflict").expectedAction} />
        </CardContent>
      </Card>
    </div>
  );
}

function BoundaryRow({ action, result }: { action: string; result: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-3">
      <p className="min-w-0 flex-1 font-medium">{action}</p>
      <p className="text-sm text-muted-foreground">{result}</p>
    </div>
  );
}

function BoolBadge({ value }: { value: boolean }) {
  return (
    <Badge className={cn("border-0", value ? "bg-[#e9f8ef] text-[#138a4a]" : "bg-[#fff0ef] text-[#c52b20]")}>
      {value ? "Allowed" : "Denied"}
    </Badge>
  );
}
