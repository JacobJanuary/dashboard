"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, Shield, Building2 } from "lucide-react";

const ROLE_STORAGE_KEY = "sparkirl_role";

const roles = [
  { href: "/organizer", label: "Организатор", icon: Briefcase, id: "organizer" },
  { href: "/owner", label: "Владелец", icon: Building2, id: "venue_owner" },
  { href: "/moderator", label: "Модератор", icon: Shield, id: "moderator" },
];

function setStoredRole(roleId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLE_STORAGE_KEY, roleId);
}

export function RoleSwitcher() {
  const pathname = usePathname();
  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/organizer") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/venue-owner") ||
    pathname.startsWith("/moderator");

  if (!isAdminRoute) return null;

  // Public routes are not a role. Only admin consoles own role context.
  let currentRoleId: string | null = null;
  if (pathname.startsWith("/moderator")) {
    currentRoleId = "moderator";
  } else if (pathname.startsWith("/owner") || pathname.startsWith("/venue-owner")) {
    currentRoleId = "venue_owner";
  } else if (pathname.startsWith("/organizer")) {
    currentRoleId = "organizer";
  }

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 bg-background/90 backdrop-blur-md border border-border rounded-full px-2 py-1.5 shadow-lg">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 hidden sm:inline">
        Admin:
      </span>
      {roles.map((role) => {
        const Icon = role.icon;
        const isActive = currentRoleId === role.id;
        return (
          <Link
            key={role.id}
            href={role.href}
            onClick={() => setStoredRole(role.id)}
          >
            <button
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="role-switcher-pill"
                  className="absolute inset-0 bg-foreground rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{role.label}</span>
              </span>
            </button>
          </Link>
        );
      })}
    </div>
  );
}
