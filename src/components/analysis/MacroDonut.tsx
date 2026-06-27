'use client';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TotalNutrition } from '@/lib/types';
import { scaledNutrition, macroPercentages } from '@/lib/nutrition';

const COLORS = ['#3b82f6', '#f59e0b', '#f43f5e'];
const MACROS = ['Protein', 'Carbs', 'Fat'];

export default function MacroDonut({ nutrition, multiplier }: { nutrition: TotalNutrition; multiplier: number }) {
  const n = scaledNutrition(nutrition, multiplier);
  const pct = macroPercentages(n);
  const data = [
    { value: n.protein, pct: pct.protein },
    { value: n.carbs,   pct: pct.carbs },
    { value: n.fat,     pct: pct.fat },
  ];

  return (
    <div className="p-5 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-3)' }}>MACRO BREAKDOWN</p>
      <div className="flex items-center gap-5">
        <div className="w-28 h-28 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={34} outerRadius={52}
                paddingAngle={2} dataKey="value" stroke="none">
                {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black leading-none" style={{ color: 'var(--text-1)' }}>{n.calories}</span>
            <span className="text-[9px]" style={{ color: 'var(--text-3)' }}>kcal</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {data.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{MACROS[i]}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>{d.value}g</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: 'var(--surface-2)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${d.pct}%`, background: COLORS[i] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
