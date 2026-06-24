import { FoodItem, TotalNutrition, NutriGrade } from './types';

export function scaledNutrition(nutrition: TotalNutrition, multiplier: number): TotalNutrition {
  return {
    calories: Math.round(nutrition.calories * multiplier),
    protein: Math.round(nutrition.protein * multiplier * 10) / 10,
    carbs: Math.round(nutrition.carbs * multiplier * 10) / 10,
    fat: Math.round(nutrition.fat * multiplier * 10) / 10,
    fiber: Math.round(nutrition.fiber * multiplier * 10) / 10,
    sugar: Math.round(nutrition.sugar * multiplier * 10) / 10,
    saturatedFat: Math.round(nutrition.saturatedFat * multiplier * 10) / 10,
  };
}

export function scaledItem(item: FoodItem, multiplier: number): FoodItem {
  return {
    ...item,
    calories: Math.round(item.calories * multiplier),
    protein: Math.round(item.protein * multiplier * 10) / 10,
    carbs: Math.round(item.carbs * multiplier * 10) / 10,
    fat: Math.round(item.fat * multiplier * 10) / 10,
  };
}

export function sumNutrition(items: TotalNutrition[]): TotalNutrition {
  return items.reduce(
    (acc, n) => ({
      calories: acc.calories + n.calories,
      protein: acc.protein + n.protein,
      carbs: acc.carbs + n.carbs,
      fat: acc.fat + n.fat,
      fiber: acc.fiber + n.fiber,
      sugar: acc.sugar + n.sugar,
      saturatedFat: acc.saturatedFat + n.saturatedFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, saturatedFat: 0 }
  );
}

export function nutriGradeColor(grade: NutriGrade): string {
  const map: Record<NutriGrade, string> = {
    A: '#10b981',
    B: '#22c55e',
    C: '#eab308',
    D: '#f97316',
    E: '#ef4444',
  };
  return map[grade];
}

export function nutriGradeLabel(grade: NutriGrade): string {
  const map: Record<NutriGrade, string> = {
    A: 'Excellent',
    B: 'Good',
    C: 'Fair',
    D: 'Poor',
    E: 'Unhealthy',
  };
  return map[grade];
}

export function macroPercentages(nutrition: TotalNutrition) {
  const proteinCal = nutrition.protein * 4;
  const carbsCal = nutrition.carbs * 4;
  const fatCal = nutrition.fat * 9;
  const total = proteinCal + carbsCal + fatCal || 1;
  return {
    protein: Math.round((proteinCal / total) * 100),
    carbs: Math.round((carbsCal / total) * 100),
    fat: Math.round((fatCal / total) * 100),
  };
}
