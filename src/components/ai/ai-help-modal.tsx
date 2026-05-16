"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Wand2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AIHelpModalProps {
  open: boolean;
  onClose: () => void;
  field: string;
  fieldLabel: string;
  currentValue: string;
  context: Record<string, string | number | boolean | null | undefined>;
  onApply: (value: string | object) => void;
}

export function AIHelpModal({
  open,
  onClose,
  field,
  fieldLabel,
  currentValue,
  context,
  onApply,
}: AIHelpModalProps) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | object | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/refine-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          currentValue,
          context,
          prompt: prompt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка генерации");
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result !== null) {
      onApply(result);
      onClose();
    }
  };

  const regenerate = () => {
    setResult(null);
    generate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-plum" />
            AI помощь — {fieldLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Context preview */}
          {Object.keys(context).length > 0 && (
            <div className="p-3 rounded-xl bg-secondary/30 text-xs space-y-1">
              <p className="font-medium text-muted-foreground">Контекст:</p>
              {Object.entries(context)
                .filter(([, v]) => v !== undefined && v !== null && v !== "")
                .map(([k, v]) => (
                  <p key={k} className="text-muted-foreground truncate">
                    {k}: {String(v)}
                  </p>
                ))}
            </div>
          )}

          {/* Prompt input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Дополнительное указание (опционально)
            </label>
            <Textarea
              placeholder="Например: сделай более эмоциональным, добавь юмор, сфокусируйся на нетворкинге..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Generate button */}
          {!result && !loading && (
            <Button
              className="w-full rounded-full gap-2 bg-plum hover:bg-plum/90"
              onClick={generate}
            >
              <Wand2 className="w-4 h-4" />
              Сгенерировать
            </Button>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-plum" />
              <span className="ml-2 text-sm text-muted-foreground">Генерирую...</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Result */}
          <AnimatePresence>
            {result !== null && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="p-4 rounded-xl bg-secondary/30">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Результат:</p>
                  {typeof result === "string" ? (
                    <p className="text-sm whitespace-pre-wrap">{result}</p>
                  ) : (
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full gap-2"
                    onClick={regenerate}
                  >
                    <Sparkles className="w-4 h-4" />
                    Ещё вариант
                  </Button>
                  <Button
                    className="flex-1 rounded-full gap-2 bg-plum hover:bg-plum/90"
                    onClick={handleApply}
                  >
                    Применить
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
