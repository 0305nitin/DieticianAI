'use client';
import { forwardRef } from 'react';

export interface WeeklyReportData {
  weekDays: { label: string; calories: number }[];
  targetCalories: number;
  avg: { protein: number; carbs: number; fat: number };
  macroTargets: { protein: number; carbs: number; fat: number };
  streak: number;
  gradeAMeals: number;
  totalScans: number;
  dateRange: string;
}

// A fixed-width, self-styled card rendered off-screen and captured to PNG via html2canvas.
// Uses explicit colors (no CSS vars) so the exported image is deterministic.
const BG = '#262624';
const SURFACE = '#30302e';
const CLAY = '#d97757';
const INK = '#f5f4ee';
const MUTED = '#a8a29a';

const WeeklyReportCard = forwardRef<HTMLDivElement, { data: WeeklyReportData }>(function WeeklyReportCard({ data }, ref) {
  const maxCal = Math.max(...data.weekDays.map((d) => d.calories), data.targetCalories, 1);
  const macros: [string, number, number, string][] = [
    ['Protein', data.avg.protein, data.macroTargets.protein, '#3b82f6'],
    ['Carbs', data.avg.carbs, data.macroTargets.carbs, '#f59e0b'],
    ['Fat', data.avg.fat, data.macroTargets.fat, '#f43f5e'],
  ];

  return (
    <div ref={ref} style={{
      width: 1080, padding: 64, background: BG, color: INK,
      fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: CLAY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em' }}>DieticianAI</div>
            <div style={{ fontSize: 15, color: MUTED }}>Weekly nutrition report</div>
          </div>
        </div>
        <div style={{ fontSize: 15, color: MUTED }}>{data.dateRange}</div>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {[
          ['Day streak', String(data.streak), '🔥'],
          ['Grade A meals', String(data.gradeAMeals), '🏆'],
          ['Meals scanned', String(data.totalScans), '🍽️'],
        ].map(([label, value, emoji]) => (
          <div key={label} style={{ flex: 1, background: SURFACE, borderRadius: 16, padding: '24px 28px' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
            <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 15, color: MUTED, marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* 7-day calories */}
      <div style={{ background: SURFACE, borderRadius: 16, padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: MUTED, letterSpacing: '0.05em' }}>THIS WEEK — CALORIES</div>
          <div style={{ fontSize: 14, color: MUTED }}>Target {data.targetCalories.toLocaleString()} kcal</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 160 }}>
          {data.weekDays.map((d, i) => {
            const h = Math.max(4, Math.round((d.calories / maxCal) * 150));
            const over = d.calories > data.targetCalories;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 12, color: MUTED }}>{d.calories || ''}</div>
                <div style={{ width: '100%', height: h, borderRadius: 6, background: d.calories === 0 ? '#3a3a37' : over ? '#ef4444' : CLAY }} />
                <div style={{ fontSize: 13, color: MUTED }}>{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macro averages */}
      <div style={{ background: SURFACE, borderRadius: 16, padding: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: MUTED, letterSpacing: '0.05em', marginBottom: 20 }}>DAILY MACRO AVERAGES</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {macros.map(([label, avg, target, color]) => {
            const pct = target > 0 ? Math.min(100, Math.round((avg / target) * 100)) : 0;
            return (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 15 }}>
                  <span style={{ fontWeight: 600 }}>{label}</span>
                  <span style={{ color: MUTED }}>{avg}g avg / {target}g target</span>
                </div>
                <div style={{ height: 10, borderRadius: 6, background: '#3a3a37', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 6, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: MUTED }}>
        Tracked with DieticianAI — AI nutrition scanner for Asian food
      </div>
    </div>
  );
});

export default WeeklyReportCard;
