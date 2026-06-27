import OpenAI from 'openai';
import { ContainerType } from './types';
import { buildPrompt, parseResult, AnalysisResult } from './gemini';

export async function analyzeWithGPT4o(
  images: { base64: string; mimeType: string }[],
  container: ContainerType,
): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const openai = new OpenAI({ apiKey });

  const imageContents = images.map(img => ({
    type: 'image_url' as const,
    image_url: {
      url: `data:${img.mimeType};base64,${img.base64}`,
      detail: 'high' as const,
    },
  }));

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        ...imageContents,
        { type: 'text', text: buildPrompt(container, images.length) },
      ],
    }],
    response_format: { type: 'json_object' },
    max_tokens: 2048,
  });

  const text = response.choices[0]?.message?.content ?? '';
  return parseResult(text);
}
