"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  Wand2,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Ticket,
  Tag,
  AlignLeft,
  Share2,
  HelpCircle,
  Bot,
  User,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { VoiceRecorder } from "@/components/voice-recorder";
import { VoiceMessage } from "@/components/voice-message";
import { formatAiAddon } from "@/lib/ai-addons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  role: "assistant" | "user";
  type: "text" | "voice";
  content?: string;
  audioUrl?: string;
  duration?: number;
  transcription?: string;
  reasoning?: string;
  action?: string;
}

interface ExtractedData {
  title_draft?: string;
  description_draft?: string;
  event_type?: string;
  event_category?: string;
  event_sub_category?: string;
  location?: string;
  date_time?: string;
  capacity?: string | number;
  target_audience?: string;
  pricing?: string;
  requirements?: string;
  keywords?: string[];
  faqs_draft?: { question: string; answer: string }[];
  demographic_filters?: { is18Plus: boolean; menOnly: boolean; womenOnly: boolean; noKids: boolean };
  ticket_types?: { name: string; type: string; price: number | null; quantity: number; description: string }[];
  [key: string]: unknown;
}

interface AIResponse {
  reasoning: string;
  acknowledgment: string;
  action: string;
  extracted_data: ExtractedData;
  next_question: string;
  ready_to_generate: boolean;
}

interface GeneratedEvent {
  title: string;
  description: string;
  sharingDescription: string;
  eventType: string;
  eventCategory: string;
  eventSubCategory: string;
  keywords: string[];
  faqs: { question: string; answer: string }[];
  ticketRecommendations: {
    name: string;
    type: "paid" | "free" | "donation";
    price: number | null;
    quantity: number;
    description: string;
  }[];
  capacitySuggestion: number;
  date?: string;
  time?: string;
  aiAddons: string[];
  demographicFilters: {
    is18Plus: boolean;
    menOnly: boolean;
    womenOnly: boolean;
    noKids: boolean;
  };
}

interface AIEventDialogProps {
  onComplete: (eventData: Partial<GeneratedEvent>) => void;
  onBack: () => void;
}

export function AIEventDialog({ onComplete, onBack }: AIEventDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedEvent | null>(null);
  const [error, setError] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [expandedReasoning, setExpandedReasoning] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with local greeting — no API call on open
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setMessages([
        {
          role: "assistant",
          type: "text",
          content: "Привет! Я помогу вам создать событие. Расскажите, что вы планируете организовать?",
          reasoning: "Начинаю интервью, жду описание события от пользователя",
          action: "Задаю первый вопрос",
        },
      ]);
    }
  }, []);

  const callAiApi = async (userContent: string) => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const currentMessages = messagesRef.current;
      const apiMessages = [
        ...currentMessages
          .filter(
            (m) =>
              m.role === "user" ||
              (m.role === "assistant" && m.content && !m.reasoning)
          )
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content:
              m.type === "voice"
                ? m.transcription || "[Голосовое сообщение]"
                : m.content || "",
          })),
        { role: "user" as const, content: userContent },
      ];

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          extractedData: extractedDataRef.current,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Ошибка AI");

      const aiResponse: AIResponse = data.data;
      setExtractedData((prev) => ({ ...prev, ...aiResponse.extracted_data }));

      const newMessages: ChatMessage[] = [
        {
          role: "assistant",
          type: "text",
          content: aiResponse.acknowledgment,
          reasoning: aiResponse.reasoning,
          action: aiResponse.action,
        },
      ];

      newMessages.push({
        role: "assistant",
        type: "text",
        content: aiResponse.next_question || "Что бы вы хотели добавить?",
      });

      setMessages((prev) => [...prev, ...newMessages]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setMessages((prev) => [...prev, { role: "user", type: "text", content: userText }]);
    setInput("");
    await callAiApi(userText);
  };

  const handleVoiceRecorded = (url: string, dur: number) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", type: "voice", audioUrl: url, duration: dur },
    ]);
  };

  const handleTranscriptionReady = (audioUrl: string, text: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.type === "voice" && msg.audioUrl === audioUrl
          ? { ...msg, transcription: text }
          : msg
      )
    );
    callAiApi(text);
  };

  // Keep refs in sync for async operations
  const messagesRef = useRef(messages);
  const extractedDataRef = useRef(extractedData);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { extractedDataRef.current = extractedData; }, [extractedData]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const conversation = messages
        .filter(
          (m) =>
            m.role === "user" ||
            (m.role === "assistant" && m.content && !m.reasoning)
        )
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content:
            m.type === "voice"
              ? m.transcription || "[Голосовое сообщение]"
              : m.content || "",
        }));

      const res = await fetch("/api/ai/generate-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка генерации");

      setGenerated(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка генерации");
    } finally {
      setGenerating(false);
    }
  };

  const handleEditField = (field: keyof GeneratedEvent, value: unknown) => {
    if (!generated) return;
    setGenerated({ ...generated, [field]: value } as GeneratedEvent);
  };

  const handleComplete = () => {
    if (generated) {
      onComplete(generated);
    }
  };

  const readyToGenerate = Object.keys(extractedData).length >= 5;

  const getReasoningIcon = (reasoning: string) => {
    if (reasoning.includes("тип") || reasoning.includes("категор")) return Target;
    if (reasoning.includes("цен") || reasoning.includes("стоим")) return Ticket;
    if (reasoning.includes("мест") || reasoning.includes("локац")) return MapPin;
    if (reasoning.includes("врем") || reasoning.includes("дат")) return Calendar;
    if (reasoning.includes("аудит") || reasoning.includes("участник")) return Users;
    return Lightbulb;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-plum" />
              Создание с помощью AI
            </h1>
            <p className="text-xs text-muted-foreground">
              {Object.keys(extractedData).length} полей собрано
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {readyToGenerate && !generated && (
            <Button
              className="rounded-full gap-2 bg-plum hover:bg-plum/90 shrink-0"
              onClick={handleGenerate}
              disabled={generating || loading}
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Сгенерировать
            </Button>
          )}
        </div>
      </div>

      {/* Extracted Data Preview */}
      {Object.keys(extractedData).length > 0 && !generated && (
        <Card className="border-0 shadow-sm bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-4 h-4 text-plum" />
              <span className="text-xs font-semibold text-plum">
                Собранная информация
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(extractedData).map(([key, value]) => {
                if (value === undefined || value === null) return null;
                const displayValue =
                  typeof value === "object"
                    ? JSON.stringify(value).slice(0, 30) + "..."
                    : String(value).slice(0, 40);
                return (
                  <Badge key={key} variant="secondary" className="text-[10px]">
                    {key}: {displayValue}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {!generated ? (
        <>
          {/* Chat */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  const isReasoningMessage =
                    msg.role === "assistant" && msg.reasoning;
                  const msgIndex = i;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-lg bg-plum/10 flex items-center justify-center shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-plum" />
                        </div>
                      )}
                      <div className={`max-w-[80%] ${isUser ? "order-2" : ""}`}>
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                            isUser
                              ? "bg-plum text-white rounded-br-md"
                              : isReasoningMessage
                              ? "bg-primary/10 text-foreground rounded-bl-md border border-primary/20"
                              : "bg-secondary/50 rounded-bl-md"
                          }`}
                        >
                          {isReasoningMessage && (
                            <div className="flex items-center gap-1 mb-1">
                              <Sparkles className="w-3 h-3 text-primary" />
                              <span className="text-[10px] font-semibold text-primary">
                                AI-ассистент
                              </span>
                            </div>
                          )}
                          {msg.type === "voice" && msg.audioUrl ? (
                            <VoiceMessage
                              audioUrl={msg.audioUrl}
                              duration={msg.duration}
                              transcription={msg.transcription}
                            />
                          ) : (
                            msg.content
                          )}
                          {msg.role === "assistant" &&
                            i === messages.length - 1 &&
                            loading && (
                              <span className="inline-flex ml-1">
                                <span
                                  className="w-1.5 h-1.5 bg-plum rounded-full animate-bounce"
                                  style={{ animationDelay: "0ms" }}
                                />
                                <span
                                  className="w-1.5 h-1.5 bg-plum rounded-full animate-bounce ml-0.5"
                                  style={{ animationDelay: "150ms" }}
                                />
                                <span
                                  className="w-1.5 h-1.5 bg-plum rounded-full animate-bounce ml-0.5"
                                  style={{ animationDelay: "300ms" }}
                                />
                              </span>
                            )}
                        </div>

                        {/* Reasoning block */}
                        {isReasoningMessage && (
                          <div className="mt-1.5">
                            <button
                              onClick={() =>
                                setExpandedReasoning(
                                  expandedReasoning === msgIndex
                                    ? null
                                    : msgIndex
                                )
                              }
                              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-plum transition-colors"
                            >
                              {(() => {
                                const Icon = getReasoningIcon(
                                  msg.reasoning || ""
                                );
                                return <Icon className="w-3 h-3" />;
                              })()}
                              <span>Мысли AI</span>
                              {expandedReasoning === msgIndex ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                            <AnimatePresence>
                              {expandedReasoning === msgIndex && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-1.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1.5">
                                    <div className="flex items-start gap-1.5">
                                      <Lightbulb className="w-3 h-3 shrink-0 mt-0.5 text-amber-600" />
                                      <div>
                                        <span className="font-semibold text-[10px] uppercase tracking-wider text-amber-600">
                                          Анализ
                                        </span>
                                        <p className="mt-0.5">
                                          {msg.reasoning}
                                        </p>
                                      </div>
                                    </div>
                                    {msg.action && (
                                      <div className="flex items-start gap-1.5">
                                        <Target className="w-3 h-3 shrink-0 mt-0.5 text-amber-600" />
                                        <div>
                                          <span className="font-semibold text-[10px] uppercase tracking-wider text-amber-600">
                                            Действие
                                          </span>
                                          <p className="mt-0.5">
                                            {msg.action}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        <p
                          className={`text-[10px] text-muted-foreground mt-1 ${
                            isUser ? "text-right" : ""
                          }`}
                        >
                          {msg.type === "voice" ? "🎤 Голосовое" : "Текст"}
                        </p>
                      </div>
                      {isUser && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ваш ответ..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={loading}
              className="rounded-full"
            />
            <VoiceRecorder
              onVoiceRecorded={handleVoiceRecorded}
              onTranscriptionReady={handleTranscriptionReady}
            />
            <Button
              className="rounded-full px-3 shrink-0 bg-plum hover:bg-plum/90"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
        </>
      ) : (
        <GeneratedPreview
          event={generated}
          onEdit={handleEditField}
          onComplete={handleComplete}
          onRegenerate={handleGenerate}
          generating={generating}
        />
      )}
    </div>
  );
}

function GeneratedPreview({
  event,
  onEdit,
  onComplete,
  onRegenerate,
  generating,
}: {
  event: GeneratedEvent;
  onEdit: (field: keyof GeneratedEvent, value: unknown) => void;
  onComplete: () => void;
  onRegenerate: () => void;
  generating: boolean;
}) {
  const titles = event.title.split(",").map((t) => t.trim());

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-bold">Черновик готов!</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Проверь и отредактируй поля перед публикацией.
      </p>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {/* Title */}
        <PreviewField icon={Sparkles} label="Название">
          <div className="space-y-2">
            {titles.map((t, i) => (
              <button
                key={i}
                onClick={() => onEdit("title", t)}
                className={`block w-full text-left p-2 rounded-lg text-sm transition-colors ${
                  event.title === t
                    ? "bg-plum/10 border border-plum/20"
                    : "hover:bg-secondary/50"
                }`}
              >
                {t}
                {event.title === t && (
                  <Badge className="ml-2 bg-plum text-white text-[10px]">
                    Выбрано
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </PreviewField>

        {/* Description */}
        <PreviewField icon={AlignLeft} label="Описание">
          <Textarea
            value={event.description}
            onChange={(e) => onEdit("description", e.target.value)}
            rows={4}
            className="resize-none text-sm"
          />
        </PreviewField>

        {/* Sharing Description */}
        <PreviewField icon={Share2} label="Sharing описание">
          <Textarea
            value={event.sharingDescription}
            onChange={(e) => onEdit("sharingDescription", e.target.value)}
            rows={2}
            className="resize-none text-sm"
          />
          <p className="text-[10px] text-muted-foreground">
            {event.sharingDescription.length}/160
          </p>
        </PreviewField>

        {/* Type & Category */}
        <PreviewField icon={Tag} label="Тип и категория">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {event.eventType}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {event.eventCategory}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {event.eventSubCategory}
            </Badge>
          </div>
        </PreviewField>

        {/* Keywords */}
        <PreviewField icon={Tag} label="Ключевые слова">
          <div className="flex gap-1 flex-wrap">
            {event.keywords.map((k, i) => (
              <Badge
                key={i}
                className="bg-primary/10 text-primary border-0 text-[10px]"
              >
                {k}
              </Badge>
            ))}
          </div>
        </PreviewField>

        {/* Capacity */}
        <PreviewField icon={Users} label="Вместимость">
          <input
            type="number"
            value={event.capacitySuggestion}
            onChange={(e) => onEdit("capacitySuggestion", Number(e.target.value))}
            className="w-32 text-sm border rounded-lg px-3 py-2"
          />
        </PreviewField>

        {/* Tickets */}
        <PreviewField icon={Ticket} label="Рекомендуемые билеты">
          <div className="space-y-2">
            {event.ticketRecommendations.map((t, i) => (
              <div key={i} className="p-2 rounded-lg bg-secondary/30 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {t.type === "free"
                      ? "Бесплатно"
                      : t.type === "donation"
                      ? "Донейшн"
                      : `$${t.price}`}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.quantity} шт.
                </p>
              </div>
            ))}
          </div>
        </PreviewField>

        {/* FAQ */}
        <PreviewField icon={HelpCircle} label="FAQ">
          <div className="space-y-2">
            {event.faqs.map((f, i) => (
              <div key={i} className="p-2 rounded-lg bg-secondary/30 text-sm">
                <p className="font-medium text-xs">{f.question}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </PreviewField>

        {/* AI Addons */}
        <PreviewField icon={Bot} label="AI-знания">
          <div className="space-y-1">
            {event.aiAddons.map((a, i) => (
              <p key={i} className="text-xs text-muted-foreground">
                • {formatAiAddon(a)}
              </p>
            ))}
          </div>
        </PreviewField>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          className="rounded-full gap-2 flex-1"
          onClick={onRegenerate}
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Перегенерировать
        </Button>
        <Button
          className="rounded-full gap-2 flex-1 bg-plum hover:bg-plum/90"
          onClick={onComplete}
        >
          <CheckCircle2 className="w-4 h-4" />
          Перейти к публикации
        </Button>
      </div>
    </div>
  );
}

function PreviewField({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Sparkles;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="w-4 h-4 text-plum" />
          {label}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
