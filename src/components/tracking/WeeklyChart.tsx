'use client';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { formatDateShort } from '@/lib/utils';
import { DAILY_TARGETS } from '@/lib/types';

interface Props {
  data: { date: string; calories: number }[];
}

export default function WeeklyChart({ data }: Props) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Weekly Calories</p>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <div className="w-2 h-2 rounded-full border border-dashed border-slate-300 dark:border-slate-600" />
          {DAILY_TARGETS.calories} kcal target
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={18}>
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fontSize: 10, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(v) => [typeof v === 'number' ? `${v} kcal` : `${v}`, 'Calories']}
              labelFormatter={(label) => formatDateShort(String(label))}
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.date}
                  fill={
                    entry.date === today
                      ? '#f97316'
                      : entry.calories >= DAILY_TARGETS.calories
                      ? '#f43f5e'
                      : '#94a3b8'
                  }
                  fillOpacity={entry.date === today ? 1 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
