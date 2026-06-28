export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType = 'lose' | 'maintain' | 'gain';

export interface UserProfile {
  name?: string;
  age: number;
  gender: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: GoalType;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_OPTIONS: { id: ActivityLevel; label: string; desc: string; emoji: string }[] = [
  { id: 'sedentary',   label: 'Sedentary',          desc: 'Desk job, little movement',    emoji: '🪑' },
  { id: 'light',       label: 'Lightly Active',      desc: '1–3 workouts/week',            emoji: '🚶' },
  { id: 'moderate',    label: 'Moderately Active',   desc: '3–5 workouts/week',            emoji: '🏃' },
  { id: 'active',      label: 'Active',              desc: '6–7 workouts/week',            emoji: '🏋️' },
  { id: 'very_active', label: 'Very Active',         desc: 'Twice/day or physical job',    emoji: '⚡' },
];

export const GOAL_OPTIONS: { id: GoalType; label: string; desc: string; emoji: string; adj: number }[] = [
  { id: 'lose',     label: 'Lose Weight',   desc: '−500 kcal deficit',  emoji: '📉', adj: -500 },
  { id: 'maintain', label: 'Maintain',      desc: 'Eat at TDEE',        emoji: '⚖️', adj: 0    },
  { id: 'gain',     label: 'Build Muscle',  desc: '+300 kcal surplus',  emoji: '💪', adj: 300  },
];

export function calculateBMR(p: UserProfile): number {
  const base = (10 * p.weightKg) + (6.25 * p.heightCm) - (5 * p.age);
  return Math.round(p.gender === 'male' ? base + 5 : base - 161);
}

export function calculateTDEE(p: UserProfile): number {
  return Math.round(calculateBMR(p) * ACTIVITY_MULTIPLIERS[p.activityLevel]);
}

export function calculateCalorieGoal(p: UserProfile): number {
  const adj = GOAL_OPTIONS.find(g => g.id === p.goal)?.adj ?? 0;
  return Math.max(1200, calculateTDEE(p) + adj);
}

export function getMacroTargets(calorieGoal: number, goal: GoalType): {
  calories: number; protein: number; carbs: number; fat: number;
} {
  const r = goal === 'lose'
    ? { protein: 0.30, carbs: 0.40, fat: 0.30 }
    : goal === 'gain'
    ? { protein: 0.25, carbs: 0.50, fat: 0.25 }
    : { protein: 0.25, carbs: 0.45, fat: 0.30 };
  return {
    calories: calorieGoal,
    protein:  Math.round((calorieGoal * r.protein) / 4),
    carbs:    Math.round((calorieGoal * r.carbs)   / 4),
    fat:      Math.round((calorieGoal * r.fat)     / 9),
  };
}
