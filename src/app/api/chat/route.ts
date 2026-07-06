import {
  buildHealingSystemPrompt,
  getFallbackReply,
  type BotContext,
} from "@/lib/healing-bot";
import type { Sentiment } from "@/lib/sentiment";
import { NextResponse } from "next/server";

type ChatRequestBody = {
  message: string;
  tone: Sentiment;
  level?: number;
  hp?: number;
  leveledUp?: boolean;
  wasRevived?: boolean;
};

const DEFAULT_MODEL = "gemini-2.0-flash";

function buildContext(body: ChatRequestBody): BotContext {
  return {
    tone: body.tone,
    level: body.level ?? 0,
    hp: body.hp ?? 0,
    leveledUp: body.leveledUp ?? false,
    wasRevived: body.wasRevived ?? false,
  };
}

async function callGemini(
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
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;

    if (!apiKey) {
      return NextResponse.json({
        reply: getFallbackReply(context),
        source: "fallback",
      });
    }

    const aiReply = await callGemini(apiKey, model, message, context);

    if (!aiReply) {
      return NextResponse.json({
        reply: getFallbackReply(context),
        source: "fallback",
      });
    }

    return NextResponse.json({
      reply: aiReply,
      source: "ai",
    });
  } catch {
    return NextResponse.json(
      { error: "failed to generate reply" },
      { status: 500 },
    );
  }
}
