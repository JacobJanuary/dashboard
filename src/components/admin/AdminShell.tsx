"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Flame,
  ListChecks,
  PanelLeft,
  Search,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPrimaryNavigation,
  getScreen,
  roleBasePaths,
  roleLabels,
} from "@/lib/admin-data";
import type { AdminRole, AdminScreenDefinition } from "@/lib/admin-types";
import { cn } from "@/lib/utils";

const ROLE_STORAGE_KEY = "sparkirl_role";

const roleTheme: Record<AdminRole, { mark: string; accent: string; label: string }> = {
  organizer: {
    mark: "bg-[linear-gradient(135deg,#6471ff,#15c781)]",
    accent: "text-[#93c5fd]",
    label: "SparkIRL Organizer",
  },
  venue_owner: {
    mark: "bg-[linear-gradient(135deg,#15c781,#6471ff)]",
    accent: "text-[#86efac]",
    label: "SparkIRL Venue",
  },
  moderator: {
    mark: "bg-[linear-gradient(135deg,#6471ff,#3f2a56)]",
    accent: "text-[#c4b5fd]",
    label: "SparkIRL Trust",
  },
};

const workspaceCopy: Record<AdminRole, { title: string; helper: string; search: string; footer: string }> = {
  organizer: {
    title: "Рабочая зона: Организатор",
    helper: "Создавайте события, отвечайте гостям и следите за выплатами.",
    search: "Поиск событий, гостей, сообщений...",
    footer: "События, сообщения, профиль и деньги собраны в одном простом рабочем пространстве.",
  },
  venue_owner: {
    title: "Рабочая зона: Владелец",
    helper: "Управляйте площадками, заявками и календарём.",
    search: "Поиск площадок, заявок, дат...",
    footer: "Площадки, заявки и календарь без технических настроек на первом уровне.",
  },
  moderator: {
    title: "Рабочая зона: Модератор",
    helper: "Разбирайте кейсы, жалобы и заявления по очереди.",
    search: "Поиск кейсов, жалоб, заявлений...",
    footer: "Модерация строится вокруг кейсов: контекст, материалы, решение.",
  },
};

function hrefFor(role: AdminRole, screen: AdminScreenDefinition) {
  const basePath = roleBasePaths[role];
  return screen.slug === "dashboard" ? basePath : `${basePath}/${screen.slug}`;
}

function isActivePath(pathname: string, role: AdminRole, screen: AdminScreenDefinition) {
  const activeSlug = getActiveSlug(pathname, role);
  const activeScreen = getScreen(role, activeSlug);
  return activeScreen.slug === screen.slug;
}

function getActiveSlug(pathname: string, role: AdminRole) {
  const basePath = roleBasePaths[role];
  if (pathname === basePath) return "dashboard";
  if (pathname.startsWith(`${basePath}/`)) {
    return decodeURIComponent(pathname.slice(basePath.length + 1));
  }
  return "dashboard";
}

export function AdminShell({
  role,
  children,
}: {
  role: AdminRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const screens = useMemo(() => getPrimaryNavigation(role), [role]);
  const theme = roleTheme[role];
  const copy = workspaceCopy[role];

  useEffect(() => {
    window.localStorage.setItem(ROLE_STORAGE_KEY, role);
  }, [role]);

  const nav = (
    <div className="flex min-h-full flex-col text-[#e5e7eb]">
      <div className="p-5">
        <div className="mb-7 flex items-center gap-3">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-white", theme.mark)}>
            {role === "moderator" ? <Shield className="h-5 w-5" /> : <Flame className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold">{theme.label}</p>
            <p className="text-[11px] text-[#a6adba]">{roleLabels[role]}</p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <ListChecks className="h-3.5 w-3.5" />
            {copy.title}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[#a6adba]">{copy.helper}</p>
        </div>

        <nav className="space-y-1">
          {screens.map((screen) => {
            const active = isActivePath(pathname, role, screen);
            return (
              <Link
                key={screen.slug}
                href={hrefFor(role, screen)}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white text-[#111827]"
                    : "text-[#cbd5e1] hover:bg-white/[0.08] hover:text-white",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{screen.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 p-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
          <p className="text-xs font-semibold">Что здесь делать</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#a6adba]">{copy.footer}</p>
        </div>
        <Link
          href="/"
          className="mt-4 flex items-center gap-2 text-sm text-[#a6adba] hover:text-white"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          В приложение
        </Link>
      </div>
    </div>
  );

  return (
    <div className="admin-console min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-80 bg-[#111827] lg:block">
        {nav}
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 lg:hidden" onClick={() => setMobileNavOpen(false)}>
          <aside
            className="h-full w-[86vw] max-w-sm overflow-y-auto bg-[#111827]"
            onClick={(event) => event.stopPropagation()}
          >
            {nav}
          </aside>
        </div>
      )}

      <div className="lg:pl-80">
        <header className="sticky top-14 z-30 border-b border-border bg-white/90 px-4 py-3 backdrop-blur lg:top-0 lg:px-8">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileNavOpen(true)}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{roleLabels[role]}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="text-[#0969b9]">Рабочая зона</span>
                </div>
                <p className="truncate text-sm font-semibold">{copy.title}</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <div className="flex h-9 w-80 items-center gap-2 rounded-xl border border-border bg-[#f8fafc] px-3 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                {copy.search}
              </div>
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
