export interface FoodItem {
  name: string;
  portionEstimate: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  hiddenIngredients: string[];
}

export interface TotalNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  saturatedFat: number;
}

export type NutriGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface ScanResult {
  id: string;
  timestamp: number;
  imageDataUrl: string;
  dishName: string;
  items: FoodItem[];
  totalNutrition: TotalNutrition;
  nutriGrade: NutriGrade;
  hawkerUncleComment: string;
  healthWarnings: string[];
  portionMultiplier: number;
}

export interface DailyLog {
  date: string;
  scanIds: string[];
}

export interface DailyMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const DAILY_TARGETS: DailyMacros = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
};
