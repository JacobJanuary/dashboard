export interface ZapierPayload {
  event: string;
  eventId: string;
  eventTitle: string;
  timestamp: string;
  [key: string]: unknown;
}

export async function sendZapierWebhook(webhookUrl: string, payload: ZapierPayload): Promise<void> {
  if (!webhookUrl || webhookUrl.trim() === "") return;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silently fail for prototype — webhooks are best-effort
  }
}
