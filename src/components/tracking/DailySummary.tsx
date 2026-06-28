'use client';
import { DailyMacros, DAILY_TARGETS } from '@/lib/types';

interface Props {
  macros: DailyMacros;
  mealCount: number;
  targets?: DailyMacros;
}

export default function DailySummary({ macros, mealCount, targets }: Props) {
  const t = targets ?? DAILY_TARGETS;
  const pct = Math.min(100, Math.round((macros.calories / t.calories) * 100));
  const remaining = t.calories - macros.calories;

  const status = pct === 0 ? 'empty' : pct <= 80 ? 'under' : pct <= 110 ? 'good' : 'over';
  const statusColor = { empty: 'var(--text-3)', under: '#3b82f6', good: '#1db954', over: '#ef4444' }[status];
  const statusLabel = {
    empty: 'No meals yet',
    under: `${remaining} kcal remaining`,
    good: 'On target',
    over: `${Math.abs(remaining)} kcal over`,
  }[status];

  return (
    <div className="h-full p-5 rounded-xl flex flex-col justify-between border"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div>
        <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-3)' }}>CALORIES TODAY</p>
        <div className="flex items-end gap-1.5 mb-1">
          <span className="text-4xl font-bold tracking-tight leading-none" style={{ color: 'var(--text-1)' }}>
            {macros.calories.toLocaleString()}
          </span>
          <span className="text-sm pb-0.5" style={{ color: 'var(--text-3)' }}>
            / {t.calories.toLocaleString()}
          </span>
        </div>
        <p className="text-xs font-medium" style={{ color: statusColor }}>{statusLabel}</p>
        {targets && (
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>Based on your profile goal</p>
        )}
      </div>

      <div className="mt-6">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: statusColor }} />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{mealCount} meal{mealCount !== 1 ? 's' : ''} logged</p>
          <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{pct}%</p>
        </div>
      </div>
    </div>
  );
}
