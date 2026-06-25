'use client';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { DailyMacros, DAILY_TARGETS } from '@/lib/types';

interface Props {
  macros: DailyMacros;
}

const COLORS = ['#f97316', '#3b82f6', '#f59e0b', '#f43f5e'];

export default function MacroRings({ macros }: Props) {
  const items = [
    { name: 'Calories', value: macros.calories, target: DAILY_TARGETS.calories, unit: 'kcal', color: COLORS[0] },
    { name: 'Protein', value: macros.protein, target: DAILY_TARGETS.protein, unit: 'g', color: COLORS[1] },
    { name: 'Carbs', value: macros.carbs, target: DAILY_TARGETS.carbs, unit: 'g', color: COLORS[2] },
    { name: 'Fat', value: macros.fat, target: DAILY_TARGETS.fat, unit: 'g', color: COLORS[3] },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-5">Today&apos;s Macros</p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const pct = Math.min(100, Math.round((item.value / item.target) * 100));
          const data = [
            { value: pct, fill: item.color },
            { value: 100 - pct, fill: 'transparent' },
          ];
          return (
            <div key={item.name} className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="relative w-20 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%" cy="50%"
                    innerRadius="70%" outerRadius="100%"
                    startAngle={90} endAngle={-270}
                    data={data}
                    barSize={6}
                  >
                    <RadialBar dataKey="value" cornerRadius={4} background={{ fill: 'var(--card-border)' }} />
                    <Tooltip
                      formatter={() => [`${item.value}${item.unit} / ${item.target}${item.unit}`, item.name]}
                      contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-black text-slate-800 dark:text-white leading-none">{pct}%</span>
                </div>
              </div>
              <p className="text-xs font-semibold mt-2" style={{ color: item.color }}>{item.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{Math.round(item.value)}{item.unit}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
