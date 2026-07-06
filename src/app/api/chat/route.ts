import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_BASE = `You are DieticianAI, a warm, practical nutrition coach focused on Singaporean and Asian food (hawker dishes, home cooking, packaged snacks).
- Give concise, actionable advice grounded in the user's actual data below.
- When they ask "what should I eat", suggest specific dishes that fit their remaining calories and goal.
- Be encouraging, never preachy. A light Singlish touch is fine but stay clear.
- If you don't have enough data, say so briefly and suggest scanning a meal.
- Keep replies short — a few sentences or a tight list. No markdown headers.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI chat is not configured (missing ANTHROPIC_API_KEY).' }, { status: 503 });
    }

    const { messages, context } = (await req.json()) as { messages: ChatMessage[]; context?: string };
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey });
    const system = context ? `${SYSTEM_BASE}\n\n--- The user's current data ---\n${context}` : SYSTEM_BASE;

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system,
      messages: messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'stream error';
          controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chat failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
