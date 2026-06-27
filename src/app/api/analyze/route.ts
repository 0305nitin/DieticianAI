import { NextRequest, NextResponse } from 'next/server';
import { ModelChoice, ContainerType, MODEL_DAILY_LIMITS } from '@/lib/types';
import { analyzeWithGemini } from '@/lib/gemini';
import { analyzeWithGPT4o } from '@/lib/openai-vision';
import { analyzeWithClaude } from '@/lib/anthropic-vision';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const images: { base64: string; mimeType: string }[] = [];
    for (let i = 0; i < 3; i++) {
      const file = (formData.get(`image_${i}`) ?? (i === 0 ? formData.get('image') : null)) as File | null;
      if (!file) break;
      const bytes = await file.arrayBuffer();
      images.push({ base64: Buffer.from(bytes).toString('base64'), mimeType: file.type || 'image/jpeg' });
    }

    if (images.length === 0) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const model = (formData.get('model') as ModelChoice | null) ?? 'gemini-2.5-flash';
    const container = (formData.get('container') as ContainerType | null) ?? 'unknown';
    const isPremiumUser = formData.get('isPremium') === 'true';
    const clientUsage = parseInt(formData.get('modelUsage') as string ?? '0', 10);

    const premiumModels: ModelChoice[] = ['gemini-2.5-pro', 'gpt-4o', 'claude-sonnet'];
    if (premiumModels.includes(model) && !isPremiumUser) {
      return NextResponse.json({ error: 'Premium subscription required for this model' }, { status: 403 });
    }

    const limit = MODEL_DAILY_LIMITS[model];
    if (Number.isFinite(limit) && clientUsage >= limit) {
      return NextResponse.json({ error: `Daily limit reached for ${model} (${limit}/day)` }, { status: 429 });
    }

    let result;
    if (model === 'gpt-4o') {
      result = await analyzeWithGPT4o(images, container);
    } else if (model === 'claude-sonnet') {
      result = await analyzeWithClaude(images, container);
    } else {
      result = await analyzeWithGemini(images, container, model === 'gemini-2.5-pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash');
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
