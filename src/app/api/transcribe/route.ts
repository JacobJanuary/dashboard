import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return new Response(
        JSON.stringify({ error: "No audio file provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const deepInfraForm = new FormData();
    deepInfraForm.append("file", file, "audio.webm");
    deepInfraForm.append("model", "openai/whisper-large-v3");
    deepInfraForm.append("response_format", "json");

    const res = await fetch("https://api.deepinfra.com/v1/openai/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
      },
      body: deepInfraForm,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("DeepInfra error:", res.status, err);
      return new Response(
        JSON.stringify({ error: `Transcription failed: ${res.status}`, detail: err }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify({ text: data.text || "" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Transcribe error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
