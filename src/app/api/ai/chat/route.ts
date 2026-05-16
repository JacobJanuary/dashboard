import { NextRequest } from "next/server";
import { chatCompletion, type DeepSeekMessage } from "@/lib/deepseek";
import { EVENT_CREATION_INTERVIEW_PROMPT } from "@/lib/ai-prompts";

// FORCE REBUILD: v7-2026-05-13
function tryParseJson(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Empty AI response");
  }

  // 1. Direct parse
  try {
    return JSON.parse(trimmed);
  } catch {
    // continue
  }

  // 2. Extract from markdown code block
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // continue
    }
  }

  // 3. Find first JSON object
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // continue
    }
  }

  // 4. Try to fix common issues: trailing commas, unescaped quotes
  const fixed = trimmed
    .replace(/,\s*([}\]])/g, "$1") // remove trailing commas
    .replace(/\n/g, "\\n"); // escape newlines in strings
  try {
    return JSON.parse(fixed);
  } catch {
    // continue
  }

  throw new Error("Failed to parse AI response as JSON");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, extractedData }: { messages: DeepSeekMessage[]; extractedData?: Record<string, unknown> } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const dateContext = `\n\n=== ТЕКУЩАЯ ДАТА И ВРЕМЯ ===\nСегодня: ${now.toISOString().split("T")[0]} (${now.toLocaleDateString("ru-RU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\nТекущее время: ${now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}\nЧасовой пояс сервера: UTC${now.getTimezoneOffset() > 0 ? "-" : "+"}${Math.abs(now.getTimezoneOffset() / 60)}\n=== КОНЕЦ ДАТЫ ===`;

    const dataContext = extractedData && Object.keys(extractedData).length > 0
      ? `\n\nУЖЕ СОБРАННЫЕ ДАННЫЕ:\n${JSON.stringify(extractedData, null, 2)}`
      : "";

    const systemPrompt = `${EVENT_CREATION_INTERVIEW_PROMPT}${dateContext}${dataContext}\n\nПродолжай интервью, учитывая уже собранные данные и текущую дату.`;

    const fullMessages: DeepSeekMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const result = await chatCompletion(fullMessages, {
      model: "deepseek-chat",
      temperature: 0.7,
      maxTokens: 4096,
      responseFormat: "json_object",
    });

    let parsed;
    try {
      parsed = tryParseJson(result);
    } catch (parseErr) {
      console.error("AI chat raw response length:", result.length);
      console.error("AI chat raw response:", result.slice(0, 2000));
      console.error("AI chat parse error:", parseErr);

      // If AI returned plain text without JSON, use it directly
      const trimmed = result.trim();
      if (trimmed && !trimmed.includes("{")) {
        // DeepSeek often returns just the next_question as plain text
        const isQuestion = trimmed.endsWith("?");

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              reasoning: "AI ответил свободным текстом без JSON",
              acknowledgment: isQuestion ? "Отлично, понял!" : trimmed,
              action: "Продолжу сбор информации",
              extracted_data: extractedData || {},
              next_question: isQuestion ? trimmed : "Расскажите ещё немного о вашем событии.",
              ready_to_generate: false,
            },
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      // Fallback: preserve extracted data so conversation context isn't lost
      const fallbackQuestion = extractedData?.location
        ? "Расскажите ещё немного о вашем событии — что бы вы хотели добавить?"
        : extractedData?.title_draft || extractedData?.event_type
          ? "Спасибо за информацию! Давайте уточним ещё несколько деталей. Какое место вы планируете для проведения?"
          : "Расскажите подробнее о вашем событии — что планируете организовать?";

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            reasoning: "AI вернул ответ в неправильном формате, использую fallback",
            acknowledgment: "Я услышал вас, но мне нужно уточнить несколько деталей.",
            action: "Продолжу сбор информации",
            extracted_data: extractedData || {},
            next_question: fallbackQuestion,
            ready_to_generate: false,
          },
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
