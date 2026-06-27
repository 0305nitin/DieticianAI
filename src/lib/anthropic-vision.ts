import Anthropic from '@anthropic-ai/sdk';
import { ContainerType } from './types';
import { buildPrompt, parseResult, AnalysisResult } from './gemini';

type AnthropicMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export async function analyzeWithClaude(
  images: { base64: string; mimeType: string }[],
  container: ContainerType,
): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const anthropic = new Anthropic({ apiKey });

  const imageBlocks = images.map(img => ({
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: (img.mimeType || 'image/jpeg') as AnthropicMediaType,
      data: img.base64,
    },
  }));

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        ...imageBlocks,
        { type: 'text', text: buildPrompt(container, images.length) },
      ],
    }],
  });

  const block = response.content.find(b => b.type === 'text');
  const text = block?.type === 'text' ? block.text : '';
  return parseResult(text);
}
