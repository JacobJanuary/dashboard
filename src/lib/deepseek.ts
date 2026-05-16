const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function streamChatCompletion(
  messages: DeepSeekMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
) {
  const { model = "deepseek-chat", temperature = 0.7, maxTokens = 2048 } = options;

  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error: ${res.status} ${err}`);
  }

  return res.body;
}

export async function chatCompletion(
  messages: DeepSeekMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: "json_object";
  } = {}
) {
  const { model = "deepseek-chat", temperature = 0.7, maxTokens = 2048, responseFormat } = options;

  const body: Record<string, unknown> = {
    model,
    messages,
    stream: false,
    temperature,
    max_tokens: maxTokens,
  };

  if (responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  // Retry once if response is empty (DeepSeek sometimes returns empty with json_object)
  if (!content.trim() && responseFormat === "json_object") {
    const retryRes = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({ ...body, response_format: undefined }),
    });
    if (!retryRes.ok) {
      const err = await retryRes.text();
      throw new Error(`DeepSeek API retry error: ${retryRes.status} ${err}`);
    }
    const retryData = await retryRes.json();
    return retryData.choices?.[0]?.message?.content ?? "";
  }

  return content;
}
