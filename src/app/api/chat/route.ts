import {
  buildHealingSystemPrompt,
  getFallbackReply,
  type BotContext,
} from "@/lib/healing-bot";
import type { Sentiment } from "@/lib/sentiment";
import { generateText } from "ai";
import { NextResponse } from "next/server";

type ChatRequestBody = {
  message: string;
  tone: Sentiment;
  level?: number;
  hp?: number;
  leveledUp?: boolean;
  wasRevived?: boolean;
};

const DEFAULT_GATEWAY_MODEL = "google/gemini-2.5-flash";
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

function buildContext(body: ChatRequestBody): BotContext {
  return {
    tone: body.tone,
    level: body.level ?? 0,
    hp: body.hp ?? 0,
    leveledUp: body.leveledUp ?? false,
    wasRevived: body.wasRevived ?? false,
  };
}

function hasGatewayAuth(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim(),
  );
}

async function callAiGateway(
  message: string,
  context: BotContext,
): Promise<string | null> {
  const model =
    process.env.AI_GATEWAY_MODEL?.trim() || DEFAULT_GATEWAY_MODEL;

  try {
    const { text } = await generateText({
      model,
      system: buildHealingSystemPrompt(context),
      prompt: message,
      temperature: 0.85,
      maxOutputTokens: 180,
      providerOptions: {
        gateway: {
          tags: ["feature:healing-chat", "app:my-mind-01"],
        },
      },
    });

    const reply = text.trim();
    return reply || null;
  } catch {
    return null;
  }
}

async function callGeminiDirect(
  apiKey: string,
  model: string,
  message: string,
  context: BotContext,
): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildHealingSystemPrompt(context) }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 180,
      },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  return text || null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    if (!["positive", "negative", "neutral"].includes(body.tone)) {
      return NextResponse.json({ error: "invalid tone" }, { status: 400 });
    }

    const context = buildContext(body);

    // 1) Preferred: AI SDK → AI Gateway (OIDC / AI_GATEWAY_API_KEY)
    if (hasGatewayAuth()) {
      const gatewayReply = await callAiGateway(message, context);
      if (gatewayReply) {
        return NextResponse.json({
          reply: gatewayReply,
          source: "ai-gateway",
        });
      }
    }

    // 2) Legacy fallback: direct Gemini API key
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (geminiKey) {
      const model = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
      const geminiReply = await callGeminiDirect(
        geminiKey,
        model,
        message,
        context,
      );
      if (geminiReply) {
        return NextResponse.json({
          reply: geminiReply,
          source: "gemini",
        });
      }
    }

    // 3) Local healing replies when no auth / provider failure
    return NextResponse.json({
      reply: getFallbackReply(context),
      source: "fallback",
    });
  } catch {
    return NextResponse.json(
      { error: "failed to generate reply" },
      { status: 500 },
    );
  }
}
