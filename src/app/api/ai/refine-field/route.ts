import { NextRequest } from "next/server";
import { chatCompletion, type DeepSeekMessage } from "@/lib/deepseek";
import {
  EVENT_CREATION_SYSTEM_PROMPT,
  TITLE_GENERATION_PROMPT,
  DESCRIPTION_GENERATION_PROMPT,
  SHARING_DESCRIPTION_PROMPT,
  FAQ_GENERATION_PROMPT,
  buildContext,
} from "@/lib/ai-prompts";

const fieldPrompts: Record<string, string> = {
  title: TITLE_GENERATION_PROMPT,
  description: DESCRIPTION_GENERATION_PROMPT,
  sharingDescription: SHARING_DESCRIPTION_PROMPT,
  faq: FAQ_GENERATION_PROMPT,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      field,
      currentValue,
      context,
      prompt,
    }: {
      field: string;
      currentValue?: string;
      context: Record<string, string | number | boolean | null | undefined>;
      prompt?: string;
    } = body;

    if (!field || !fieldPrompts[field]) {
      return new Response(
        JSON.stringify({ error: `Unsupported field: ${field}. Supported: ${Object.keys(fieldPrompts).join(", ")}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const ctx = buildContext({ ...context, currentValue });
    let userPrompt = fieldPrompts[field].replace("{{CONTEXT}}", ctx);

    if (prompt) {
      userPrompt += `\n\nДополнительное указание от пользователя: ${prompt}`;
    }

    const messages: DeepSeekMessage[] = [
      { role: "system", content: EVENT_CREATION_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ];

    const result = await chatCompletion(messages, {
      model: "deepseek-chat",
      temperature: 0.7,
      maxTokens: field === "faq" ? 2048 : 1024,
      responseFormat: "json_object",
    });

    let parsed = result;
    try {
      const jsonResult = JSON.parse(result);
      if (field === "title" && jsonResult.titles) {
        parsed = jsonResult.titles.join(", ");
      } else if (field === "description" && jsonResult.description) {
        parsed = jsonResult.description;
      } else if (field === "sharingDescription" && jsonResult.sharingDescription) {
        parsed = jsonResult.sharingDescription;
      } else if (field === "faq" && jsonResult.faqs) {
        parsed = jsonResult.faqs;
      }
    } catch {
      const match = result.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        try {
          const jsonResult = JSON.parse(match[1].trim());
          if (field === "title" && jsonResult.titles) {
            parsed = jsonResult.titles.join(", ");
          } else if (field === "description" && jsonResult.description) {
            parsed = jsonResult.description;
          } else if (field === "sharingDescription" && jsonResult.sharingDescription) {
            parsed = jsonResult.sharingDescription;
          } else if (field === "faq" && jsonResult.faqs) {
            parsed = jsonResult.faqs;
          }
        } catch {
          // keep raw result
        }
      }
    }

    return new Response(JSON.stringify({ success: true, result: parsed }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Refine field error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
