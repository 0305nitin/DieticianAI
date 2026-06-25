'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TotalNutrition } from '@/lib/types';
import { scaledNutrition, macroPercentages } from '@/lib/nutrition';

const COLORS = ['#3b82f6', '#f59e0b', '#f43f5e'];
const LABELS = ['Protein', 'Carbs', 'Fat'];

interface Props {
  nutrition: TotalNutrition;
  multiplier: number;
}

export default function MacroDonut({ nutrition, multiplier }: Props) {
  const n = scaledNutrition(nutrition, multiplier);
  const pct = macroPercentages(n);
  const data = [
    { name: 'Protein', value: n.protein, pct: pct.protein },
    { name: 'Carbs', value: n.carbs, pct: pct.carbs },
    { name: 'Fat', value: n.fat, pct: pct.fat },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Macro Breakdown</p>
      <div className="flex items-center gap-4">
        <div className="w-32 h-32 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={56} paddingAngle={2} dataKey="value" stroke="none">
                {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip
                formatter={(v, name) => [typeof v === 'number' ? `${v}g` : `${v}`, name]}
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '8px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-black text-slate-900 dark:text-white">{n.calories}</span>
            <span className="text-[10px] text-slate-400">kcal</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {data.map((d, i) => (
            <div key={d.name}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{LABELS[i]}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{d.value}g</span>
                  <span className="text-[10px] text-slate-400">{d.pct}%</span>
                </div>
              </div>
              <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-700">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.pct}%`, background: COLORS[i] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
