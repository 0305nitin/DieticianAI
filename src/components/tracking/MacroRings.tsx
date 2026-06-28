'use client';
import { DailyMacros, DAILY_TARGETS } from '@/lib/types';

interface Props {
  macros: DailyMacros;
  targets?: DailyMacros;
}

const items = [
  { key: 'protein' as const, label: 'Protein', unit: 'g', color: '#3b82f6' },
  { key: 'carbs'   as const, label: 'Carbs',   unit: 'g', color: '#f59e0b' },
  { key: 'fat'     as const, label: 'Fat',      unit: 'g', color: '#f43f5e' },
];

function Ring({ value, target, color }: { value: number; target: number; color: string }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / target);
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        style={{ transition: 'stroke-dashoffset 0.7s ease' }}
      />
    </svg>
  );
}

export default function MacroRings({ macros, targets }: Props) {
  const t = targets ?? DAILY_TARGETS;
  return (
    <div className="h-full p-5 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-3)' }}>MACROS</p>
      <div className="flex items-center justify-around">
        {items.map(({ key, label, unit, color }) => {
          const val = Math.round(macros[key]);
          const target = t[key];
          return (
            <div key={key} className="flex flex-col items-center gap-2">
              <div className="relative">
                <Ring value={val} target={target} color={color} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-1)' }}>
                    {Math.min(99, Math.round((val / target) * 100))}%
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold leading-none mb-0.5" style={{ color: 'var(--text-1)' }}>{val}{unit}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{label}</p>
                <p className="text-[9px]" style={{ color: 'var(--text-3)' }}>/ {target}{unit}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
