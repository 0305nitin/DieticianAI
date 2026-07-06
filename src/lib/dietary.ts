import { FoodItem } from './types';
import { DietaryPref } from './bmr';

interface DietaryInput {
  items: FoodItem[];
  warnings?: string[];
  dishName?: string;
}

/** Keyword rules per preference. A match on any keyword flags a conflict. */
const RULES: Record<DietaryPref, { keywords: string[]; message: string }> = {
  halal: {
    message: 'Contains pork or alcohol — likely not halal',
    keywords: ['pork', 'lard', 'bacon', 'ham', 'char siu', 'lup cheong', 'lap cheong',
      'alcohol', 'rum', 'wine', 'mirin', 'sake', 'beer', 'shaoxing'],
  },
  vegetarian: {
    message: 'Contains meat or seafood — not vegetarian',
    keywords: ['chicken', 'pork', 'beef', 'mutton', 'lamb', 'duck', 'fish', 'prawn', 'shrimp',
      'anchovy', 'ikan', 'meat', 'seafood', 'oyster', 'fish sauce', 'belacan', 'hae bee', 'lard', 'squid', 'crab'],
  },
  vegan: {
    message: 'Contains animal products — not vegan',
    keywords: ['chicken', 'pork', 'beef', 'mutton', 'lamb', 'duck', 'fish', 'prawn', 'shrimp',
      'anchovy', 'ikan', 'meat', 'seafood', 'oyster', 'fish sauce', 'belacan', 'hae bee', 'lard', 'squid', 'crab',
      'egg', 'milk', 'cheese', 'butter', 'honey', 'cream', 'ghee', 'dairy', 'condensed milk'],
  },
  'low-sodium': {
    message: 'High in sodium',
    keywords: ['soy sauce', 'fish sauce', 'salted', 'msg', 'preserved', 'sambal', 'belacan',
      'high sodium', 'sodium', 'salt', 'oyster sauce', 'dark soy'],
  },
  'gluten-free': {
    message: 'Contains gluten (wheat / noodles)',
    keywords: ['noodle', 'mee', 'wheat', 'bread', 'flour', 'bun', 'pasta', 'soy sauce',
      'wonton', 'dumpling', 'batter', 'biscuit', 'prata', 'roti', 'bao'],
  },
};

/**
 * Returns a human-readable conflict message for each preference the meal violates.
 * Matching is keyword-based over dish name, item names, hidden ingredients, and warnings.
 */
export function checkDietaryConflicts(input: DietaryInput, prefs?: DietaryPref[]): string[] {
  if (!prefs || prefs.length === 0) return [];

  const haystack = [
    input.dishName ?? '',
    ...input.items.flatMap((i) => [i.name, ...(i.hiddenIngredients ?? [])]),
    ...(input.warnings ?? []),
  ].join(' ').toLowerCase();

  const conflicts: string[] = [];
  for (const pref of prefs) {
    const rule = RULES[pref];
    if (rule && rule.keywords.some((k) => haystack.includes(k))) {
      conflicts.push(rule.message);
    }
  }
  return conflicts;
}
