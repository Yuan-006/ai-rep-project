import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

export const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function streamChat(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number; top_p?: number }
): Promise<ReadableStream> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 45000);

  try {
    const response = await client.chat.completions.create(
      {
        model: MODEL,
        messages,
        temperature: options?.temperature ?? 0.4,
        max_tokens: options?.max_tokens ?? 800,
        top_p: options?.top_p ?? 0.9,
        stream: true,
      },
      { signal: abortController.signal }
    );

    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(streamController) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              streamController.enqueue(encoder.encode(data));
            }
          }
          streamController.enqueue(encoder.encode("data: [DONE]\n\n"));
          streamController.close();
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Unknown error";
          streamController.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
          );
          streamController.close();
        } finally {
          clearTimeout(timeoutId);
        }
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function invokeChat(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number; top_p?: number }
): Promise<string> {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    temperature: options?.temperature ?? 0.4,
    max_tokens: options?.max_tokens ?? 2000,
    top_p: options?.top_p ?? 0.9,
  });

  return response.choices[0]?.message?.content || "";
}
