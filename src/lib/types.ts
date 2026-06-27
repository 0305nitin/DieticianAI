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
  modelUsed?: ModelChoice;
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

export type ModelChoice = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gpt-4o' | 'claude-sonnet';

export type ContainerType =
  | 'hawker_plate'
  | 'rice_bowl'
  | 'noodle_bowl'
  | 'takeaway_box'
  | 'small_plate'
  | 'unknown';

export const MODEL_DAILY_LIMITS: Record<ModelChoice, number> = {
  'gemini-2.5-flash': Infinity,
  'gemini-2.5-pro': 5,
  'gpt-4o': 3,
  'claude-sonnet': 3,
};

export const MODEL_LABELS: Record<ModelChoice, string> = {
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-2.5-pro': 'Gemini 2.5 Pro',
  'gpt-4o': 'GPT-4o',
  'claude-sonnet': 'Claude Sonnet',
};

export const CONTAINER_OPTIONS = [
  { id: 'hawker_plate' as ContainerType, label: 'Hawker Plate', emoji: '🍽️', hint: '~27cm plate' },
  { id: 'rice_bowl'    as ContainerType, label: 'Rice Bowl',    emoji: '🍚', hint: '~15cm bowl' },
  { id: 'noodle_bowl'  as ContainerType, label: 'Noodle Bowl',  emoji: '🍜', hint: '~18cm bowl' },
  { id: 'takeaway_box' as ContainerType, label: 'Takeaway Box', emoji: '📦', hint: 'Clamshell' },
  { id: 'small_plate'  as ContainerType, label: 'Side Dish',    emoji: '🤘', hint: '~15cm' },
  { id: 'unknown'      as ContainerType, label: 'Not sure',     emoji: '❓', hint: 'AI estimates' },
];
