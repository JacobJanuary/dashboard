"use client";

import { motion } from "framer-motion";
import { Sparkles, Pencil, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AIModeSelectorProps {
  onSelectManual: () => void;
  onSelectAI: () => void;
}

export function AIModeSelector({ onSelectManual, onSelectAI }: AIModeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Создать событие</h1>
        <p className="text-sm text-muted-foreground">
          Выберите способ создания
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full"
            onClick={onSelectManual}
          >
            <CardContent className="p-6 flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Pencil className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Создать вручную</h3>
              <p className="text-sm text-muted-foreground flex-1">
                Полный контроль над каждым полем. 7 шагов: место, детали, AI-аддоны, расписание, билеты, медиа и публикация.
              </p>
              <div className="flex items-center text-sm text-primary font-medium mt-4 group-hover:gap-2 transition-all">
                Начать
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full bg-gradient-to-br from-plum/5 to-primary/5"
            onClick={onSelectAI}
          >
            <CardContent className="p-6 flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-plum/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-plum" />
              </div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                Создать с помощью AI
                <span className="text-[10px] bg-plum/10 text-plum px-2 py-0.5 rounded-full font-medium">
                  Бета
                </span>
              </h3>
              <p className="text-sm text-muted-foreground flex-1">
                AI-ассистент задаст 4 вопроса и сгенерирует полное событие: название, описание, билеты, FAQ и многое другое.
              </p>
              <div className="flex items-center text-sm text-plum font-medium mt-4 group-hover:gap-2 transition-all">
                Попробовать
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        AI поможет сгенерировать ~80% контента. Дату, время и место нужно указать вручную.
      </p>
    </div>
  );
}
