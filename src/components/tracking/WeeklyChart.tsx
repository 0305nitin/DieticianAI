'use client';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine } from 'recharts';
import { formatDateShort } from '@/lib/utils';
import { DAILY_TARGETS } from '@/lib/types';

export default function WeeklyChart({ data }: { data: { date: string; calories: number }[] }) {
  const today = new Date().toISOString().split('T')[0];
  const max = Math.max(...data.map(d => d.calories), DAILY_TARGETS.calories);

  return (
    <div className="p-5 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>WEEKLY CALORIES</p>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-3)' }}>
          <div className="w-4 h-px border-t border-dashed" style={{ borderColor: 'var(--text-3)' }} />
          {DAILY_TARGETS.calories.toLocaleString()} target
        </div>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={24} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" tickFormatter={formatDateShort}
              tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, max * 1.1]} />
            <ReferenceLine y={DAILY_TARGETS.calories} stroke="var(--text-3)" strokeDasharray="4 3" strokeWidth={1} />
            <Tooltip
              formatter={(v) => [typeof v === 'number' ? `${v.toLocaleString()} kcal` : v, 'Calories']}
              labelFormatter={l => formatDateShort(String(l))}
              contentStyle={{ background: 'var(--surface-2)', border: 'none', borderRadius: '8px', fontSize: '12px', color: 'var(--text-1)' }}
              cursor={{ fill: 'var(--border)' }}
            />
            <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
              {data.map(d => (
                <Cell key={d.date}
                  fill={d.date === today ? 'var(--accent)' : d.calories >= DAILY_TARGETS.calories ? '#ef4444' : 'var(--surface-2)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
