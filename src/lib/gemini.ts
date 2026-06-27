import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScanResult, FoodItem, TotalNutrition, NutriGrade, ContainerType } from './types';

const CONTAINER_CONTEXT: Record<ContainerType, string> = {
  hawker_plate:  'Container: standard hawker dinner plate (~26-28cm diameter). Use this to calibrate all portion sizes.',
  rice_bowl:     'Container: standard rice bowl (~13-16cm diameter, ~350-450ml capacity).',
  noodle_bowl:   'Container: standard noodle bowl (~17-20cm diameter, ~600-800ml capacity).',
  takeaway_box:  'Container: standard takeaway clamshell box (~15x10cm, ~500-700ml capacity).',
  small_plate:   'Container: small side-dish plate (~13-15cm diameter, ~200-300ml capacity).',
  unknown:       'Container: unknown - estimate using any visible reference objects.',
};

export function buildPrompt(container: ContainerType, imageCount: number): string {
  const multiAngleNote = imageCount > 1
    ? `Multiple angles provided (${imageCount} images). Use side/angled views to estimate food height and 3D volume.`
    : 'Single image provided.';

  return `You are a Singapore hawker food nutrition expert with deep knowledge of Asian cuisine.
Analyze this meal photo carefully.

PORTION ESTIMATION - CRITICAL:
${multiAngleNote}
${CONTAINER_CONTEXT[container]}
Also look for ANY visible reference objects that reveal scale:
  * Chopsticks ~= 23 cm long
  * Fork / spoon ~= 18-20 cm long
  * 500 ml drink can ~= 12 cm tall, 6.5 cm diameter
  * Adult hand / fingers for relative scale
  * Plate or bowl rim diameter
Use these cues to calibrate ALL portion estimates before reporting grams or volume.

Identify EVERY distinct food item on the plate/in the bowl. For each item:
- Estimate the portion size using the reference objects above
- List ALL hidden ingredients (cooking oils, sauces, coconut milk, lard, sugar, MSG, etc.)
- Provide accurate nutritional values

Return ONLY valid JSON (no markdown, no extra text) matching this exact schema:
{
  "dishName": "Full descriptive name of the overall meal",
  "items": [
    {
      "name": "Food item name",
      "portionEstimate": "e.g. 1 cup (~240ml), 200g, 3 pieces (~90g)",
      "calories": 350,
      "protein": 15.5,
      "carbs": 42.0,
      "fat": 12.3,
      "fiber": 2.1,
      "hiddenIngredients": ["lard", "dark soy sauce", "msg", "palm oil"]
    }
  ],
  "totalNutrition": {
    "calories": 650,
    "protein": 28.5,
    "carbs": 78.0,
    "fat": 24.5,
    "fiber": 4.2,
    "sugar": 8.1,
    "saturatedFat": 9.3
  },
  "nutriGrade": "C",
  "hawkerUncleComment": "Wah lau eh! You eat this every day ah?",
  "healthWarnings": ["High saturated fat from coconut milk"]
}

nutriGrade rules: A=excellent (<500 kcal, balanced), B=good (500-650 kcal), C=fair (650-800 kcal), D=poor (800-1000 kcal), E=unhealthy (>1000 kcal or very high sat fat/sugar)
hawkerUncleComment: Singlish, funny and slightly snarky but caring, reference specific ingredients found.
If no food is clearly visible, return dishName: "Unknown dish" with best-effort estimated values.`;
}

type AnalysisResult = Omit<ScanResult, 'id' | 'timestamp' | 'imageDataUrl' | 'portionMultiplier' | 'modelUsed'>;

export function parseResult(text: string): AnalysisResult {
  const jsonMatch = text.trim().match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid JSON response from AI model');
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    dishName:           parsed.dishName ?? 'Unknown dish',
    items:              (parsed.items ?? []) as FoodItem[],
    totalNutrition:     parsed.totalNutrition as TotalNutrition,
    nutriGrade:         (parsed.nutriGrade ?? 'C') as NutriGrade,
    hawkerUncleComment: parsed.hawkerUncleComment ?? 'Cannot see the food lah!',
    healthWarnings:     parsed.healthWarnings ?? [],
  };
}

export async function analyzeWithGemini(
  images: { base64: string; mimeType: string }[],
  container: ContainerType,
  modelId: 'gemini-2.5-flash' | 'gemini-2.5-pro',
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelId });

  const parts: Parameters<typeof model.generateContent>[0] = [
    buildPrompt(container, images.length),
    ...images.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } })),
  ];

  const result = await model.generateContent(parts);
  return parseResult(result.response.text());
}

export async function analyzeFood(imageBase64: string, mimeType: string): Promise<AnalysisResult> {
  return analyzeWithGemini([{ base64: imageBase64, mimeType }], 'unknown', 'gemini-2.5-flash');
}

export type { AnalysisResult };
