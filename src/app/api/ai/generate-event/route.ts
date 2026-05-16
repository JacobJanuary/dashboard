import { NextRequest } from "next/server";
import { chatCompletion, type DeepSeekMessage } from "@/lib/deepseek";
import { EVENT_CREATION_SYSTEM_PROMPT, EVENT_GENERATION_PROMPT } from "@/lib/ai-prompts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversation }: { conversation: DeepSeekMessage[] } = body;

    if (!conversation || !Array.isArray(conversation)) {
      return new Response(JSON.stringify({ error: "conversation array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const messages: DeepSeekMessage[] = [
      { role: "system", content: EVENT_CREATION_SYSTEM_PROMPT },
      ...conversation,
      { role: "user", content: EVENT_GENERATION_PROMPT },
    ];

    const result = await chatCompletion(messages, {
      model: "deepseek-chat",
      temperature: 0.5,
      maxTokens: 4096,
      responseFormat: "json_object",
    });

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      // If JSON parsing fails, try to extract JSON from markdown code block
      const match = result.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1].trim());
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate event error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
