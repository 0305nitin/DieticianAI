import { NextRequest, NextResponse } from 'next/server';
import { NutriGrade } from '@/lib/types';

export const runtime = 'nodejs';

// Open Food Facts fields we care about (a small slice of a large object).
interface OFFProduct {
  product_name?: string;
  brands?: string;
  serving_size?: string;
  image_url?: string;
  image_front_url?: string;
  nutriscore_grade?: string;
  nutriments?: Record<string, number | string | undefined>;
  nutrient_levels?: Record<string, string>;
}

function num(v: number | string | undefined): number {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? Math.round((n as number) * 10) / 10 : 0;
}

/** Prefer per-serving values, fall back to per-100g. */
function pick(nutriments: Record<string, number | string | undefined>, key: string): number {
  return num(nutriments[`${key}_serving`] ?? nutriments[`${key}_100g`] ?? nutriments[key]);
}

function toGrade(g?: string): NutriGrade {
  const up = (g ?? '').toUpperCase();
  return (['A', 'B', 'C', 'D', 'E'].includes(up) ? up : 'C') as NutriGrade;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.trim();
  if (!code || !/^\d{6,14}$/.test(code)) {
    return NextResponse.json({ error: 'Enter a valid barcode (6–14 digits).' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,serving_size,image_url,image_front_url,nutriscore_grade,nutriments,nutrient_levels`,
      { headers: { 'User-Agent': 'DieticianAI/1.0 (nutrition scanner)' }, cache: 'no-store' }
    );
    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      return NextResponse.json({ error: 'Product not found in Open Food Facts.' }, { status: 404 });
    }

    const p = data.product as OFFProduct;
    const nutri = p.nutriments ?? {};
    const name = p.product_name?.trim() || p.brands?.split(',')[0]?.trim() || 'Packaged food';
    const calories = num(nutri['energy-kcal_serving'] ?? nutri['energy-kcal_100g'] ?? nutri['energy-kcal']);
    const protein = pick(nutri, 'proteins');
    const carbs = pick(nutri, 'carbohydrates');
    const fat = pick(nutri, 'fat');
    const fiber = pick(nutri, 'fiber');
    const sugar = pick(nutri, 'sugars');
    const saturatedFat = pick(nutri, 'saturated-fat');

    // Derive simple health warnings from OFF's nutrient levels.
    const levels = p.nutrient_levels ?? {};
    const warnings: string[] = [];
    if (levels.fat === 'high') warnings.push('High in fat');
    if (levels['saturated-fat'] === 'high') warnings.push('High in saturated fat');
    if (levels.sugars === 'high') warnings.push('High in sugar');
    if (levels.salt === 'high') warnings.push('High in salt / sodium');

    const portion = p.serving_size?.trim() || 'per 100g';

    return NextResponse.json({
      dishName: name,
      nutriGrade: toGrade(p.nutriscore_grade),
      imageDataUrl: p.image_url || p.image_front_url || '',
      totalNutrition: { calories, protein, carbs, fat, fiber, sugar, saturatedFat },
      items: [{
        name,
        portionEstimate: portion,
        calories, protein, carbs, fat, fiber,
        hiddenIngredients: [],
      }],
      hawkerUncleComment: `Scanned from the label — nutrition shown ${portion}. Numbers straight from the packaging lah, quite accurate one.`,
      healthWarnings: warnings,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Barcode lookup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
