"use client";

import { motion } from "framer-motion";
import {
  Shield,
  BadgeCheck,
  Settings,
  ChevronRight,
  Star,
  Calendar,
  Users,
  Heart,
  LayoutDashboard,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold">Профиль</h1>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5 text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-3">
            <Avatar className="w-24 h-24 ring-4 ring-primary/20">
              <AvatarImage src="/demo/avatars/avatar-01.png" />
              <AvatarFallback className="text-2xl">M</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-4 border-background">
              <BadgeCheck className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-lg font-bold">Maya, 27</h2>
          <p className="text-sm text-muted-foreground">Los Angeles</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Badge className="bg-mint/20 text-emerald-700 border-0">
              <Shield className="w-3 h-3 mr-1" />
              Фото верифицировано
            </Badge>
            <Badge variant="secondary">She/her</Badge>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">12</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Событий</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">8</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Связей</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Heart className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">4.9</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Рейтинг</p>
          </div>
        </motion.div>

        {/* Interests */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="font-semibold mb-3">Интересы</h3>
          <div className="flex flex-wrap gap-2">
            {["Музыка", "Походы", "Йога", "Живая музыка", "Викторины", "Вино", "Путешествия", "Фотография"].map(
              (interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm font-normal"
                >
                  {interest}
                </Badge>
              )
            )}
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1"
        >
          <h3 className="font-semibold mb-3">Настройки</h3>

          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Показывать в списках участников</p>
                  <p className="text-xs text-muted-foreground">
                    Другие видят, что вы идёте
                  </p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Напоминания о событиях</p>
                  <p className="text-xs text-muted-foreground">
                    За 24ч и за 2ч до событий
                  </p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <Link href="/organizer" className="w-full flex items-center justify-between p-4 text-left active:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Панель организатора</p>
                  <p className="text-xs text-muted-foreground">
                    Управление событиями и аналитика
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <button className="w-full flex items-center justify-between p-4 text-left active:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Безопасность и конфиденциальность</p>
                  <p className="text-xs text-muted-foreground">
                    Верификация, блокировка, жалобы
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
