'use client';
import { DailyMacros, DAILY_TARGETS } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  macros: DailyMacros;
  mealCount: number;
}

export default function DailySummary({ macros, mealCount }: Props) {
  const pct = Math.round((macros.calories / DAILY_TARGETS.calories) * 100);
  const remaining = DAILY_TARGETS.calories - macros.calories;

  const getMessage = () => {
    if (mealCount === 0) return "No meals logged today. Go scan your food lah!";
    if (pct < 50) return `You've only hit ${pct}% of your daily goal. Aiyah, need to eat more!`;
    if (pct <= 90) return `Great progress! ${remaining > 0 ? `${remaining} kcal remaining` : 'Right on target'}.`;
    if (pct <= 110) return "Almost at your target — well done, uncle proud!";
    return `You've exceeded your target by ${Math.abs(remaining)} kcal. Aiyoh, don't eat so much lah!`;
  };

  const Icon = pct < 90 ? TrendingUp : pct <= 110 ? Minus : TrendingDown;
  const color = pct < 90 ? 'text-blue-500' : pct <= 110 ? 'text-emerald-500' : 'text-red-500';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Today&apos;s Summary</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {macros.calories}
            <span className="text-sm font-medium text-slate-400 ml-1">/ {DAILY_TARGETS.calories} kcal</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{mealCount} meal{mealCount !== 1 ? 's' : ''} logged</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 ${color}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{getMessage()}</p>
    </div>
  );
}
