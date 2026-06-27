import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScanResult, FoodItem, TotalNutrition, NutriGrade } from './types';

const PROMPT = `You are a Singapore hawker food nutrition expert with deep knowledge of Asian cuisine.
Analyze this meal photo carefully.

Identify EVERY distinct food item on the plate/in the bowl. For each item:
- Estimate the portion size visually
- List ALL hidden ingredients (cooking oils, sauces, coconut milk, lard, sugar, etc.)
- Provide accurate nutritional values

Return ONLY valid JSON (no markdown, no extra text) matching this exact schema:
{
  "dishName": "Full descriptive name of the overall meal",
  "items": [
    {
      "name": "Food item name",
      "portionEstimate": "e.g. 1 cup, 200g, 3 pieces",
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
  "hawkerUncleComment": "Wah lau eh! You eat this every day ah? The char kway teow got so much lard leh, your cholesterol going up already. But okay lah, at least got protein. Next time ask for less oil, can?",
  "healthWarnings": ["High saturated fat from coconut milk", "Elevated sodium from soy sauce"]
}

nutriGrade rules: A=excellent (balanced, <500cal), B=good (moderate, 500-650cal), C=fair (some concerns, 650-800cal), D=poor (high cal/fat/sugar, 800-1000cal), E=unhealthy (>1000cal or very high saturated fat/sugar)
hawkerUncleComment: Write in Singaporean Singlish, be funny and slightly snarky but caring, reference specific ingredients you found.
If no food is clearly visible, return dishName: "Unknown dish" with estimated values.`;

export async function analyzeFood(imageBase64: string, mimeType: string): Promise<Omit<ScanResult, 'id' | 'timestamp' | 'imageDataUrl' | 'portionMultiplier'>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    PROMPT,
    { inlineData: { data: imageBase64, mimeType } },
  ]);

  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid JSON response from Gemini');

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    dishName: parsed.dishName ?? 'Unknown dish',
    items: (parsed.items ?? []) as FoodItem[],
    totalNutrition: parsed.totalNutrition as TotalNutrition,
    nutriGrade: (parsed.nutriGrade ?? 'C') as NutriGrade,
    hawkerUncleComment: parsed.hawkerUncleComment ?? 'Cannot see the food lah!',
    healthWarnings: parsed.healthWarnings ?? [],
  };
}
