'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flame, Award, Share2, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { getAllScans, getMonthlyLogs, getDailyLog } from '@/lib/storage';
import { scaledNutrition, sumNutrition, GRADE_COLORS } from '@/lib/nutrition';
import { NutriGrade, ScanResult, DAILY_TARGETS } from '@/lib/types';
import { useProfile } from '@/hooks/useProfile';
import { calculateCalorieGoal, getMacroTargets } from '@/lib/bmr';
import { formatDateShort } from '@/lib/utils';
import WeeklyReportCard, { WeeklyReportData } from '@/components/insights/WeeklyReportCard';

function computeStreak(): number {
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const log = getDailyLog(d.toISOString().split('T')[0]);
    if (log.scanIds.length === 0) break;
    streak++;
  }
  return streak;
}

export default function InsightsPage() {
  const { profile } = useProfile();
  const [calData, setCalData] = useState<{ date: string; calories: number }[]>([]);
  const [gradeDist, setGradeDist] = useState<{ grade: NutriGrade; count: number }[]>([]);
  const [topDishes, setTopDishes] = useState<{ name: string; count: number; grade: NutriGrade }[]>([]);
  const [streak, setStreak] = useState(0);
  const [gradeAMeals, setGradeAMeals] = useState(0);
  const [avgMacros, setAvgMacros] = useState({ protein: 0, carbs: 0, fat: 0 });
  const [totalScans, setTotalScans] = useState(0);
  const [hasData, setHasData] = useState(false);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const targets = profile
    ? getMacroTargets(calculateCalorieGoal(profile), profile.goal)
    : DAILY_TARGETS;

  useEffect(() => {
    const allScans = getAllScans();
    const scanMap = new Map(allScans.map(s => [s.id, s]));
    const logs = getMonthlyLogs();

    setHasData(allScans.length > 0);
    setTotalScans(allScans.length);
    setStreak(computeStreak());
    setGradeAMeals(allScans.filter(s => s.nutriGrade === 'A').length);

    // 30-day calorie chart
    setCalData(logs.map(log => {
      const scans = log.scanIds.map(id => scanMap.get(id)).filter(Boolean) as ScanResult[];
      const cals = scans.reduce((sum, s) =>
        sum + scaledNutrition(s.totalNutrition, s.portionMultiplier).calories, 0);
      return { date: log.date, calories: cals };
    }));

    // Grade distribution (all time)
    const gradeCount: Partial<Record<NutriGrade, number>> = {};
    allScans.forEach(s => { gradeCount[s.nutriGrade] = (gradeCount[s.nutriGrade] ?? 0) + 1; });
    setGradeDist((['A', 'B', 'C', 'D', 'E'] as NutriGrade[])
      .filter(g => (gradeCount[g] ?? 0) > 0)
      .map(g => ({ grade: g, count: gradeCount[g]! })));

    // Top dishes
    const dishMap = new Map<string, { count: number; grade: NutriGrade }>();
    allScans.forEach(s => {
      const ex = dishMap.get(s.dishName);
      if (ex) { ex.count++; } else { dishMap.set(s.dishName, { count: 1, grade: s.nutriGrade }); }
    });
    setTopDishes(
      Array.from(dishMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([name, { count, grade }]) => ({ name, count, grade }))
    );

    // 7-day macro averages
    const last7 = logs.slice(-7);
    let totalP = 0, totalC = 0, totalF = 0, activeDays = 0;
    last7.forEach(log => {
      const scans = log.scanIds.map(id => scanMap.get(id)).filter(Boolean) as ScanResult[];
      if (scans.length === 0) return;
      activeDays++;
      const totals = sumNutrition(scans.map(s => scaledNutrition(s.totalNutrition, s.portionMultiplier)));
      totalP += totals.protein; totalC += totals.carbs; totalF += totals.fat;
    });
    if (activeDays > 0) {
      setAvgMacros({
        protein: Math.round(totalP / activeDays),
        carbs: Math.round(totalC / activeDays),
        fat: Math.round(totalF / activeDays),
      });
    }
  }, []);

  const calMax = Math.max(...calData.map(d => d.calories), targets.calories, 1);

  const week = calData.slice(-7);
  const reportData: WeeklyReportData = {
    weekDays: week.map(d => ({ label: formatDateShort(d.date).split(' ')[0], calories: d.calories })),
    targetCalories: targets.calories,
    avg: avgMacros,
    macroTargets: { protein: targets.protein, carbs: targets.carbs, fat: targets.fat },
    streak, gradeAMeals, totalScans,
    dateRange: week.length ? `${formatDateShort(week[0].date)} – ${formatDateShort(week[week.length - 1].date)}` : '',
  };

  const handleExport = async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#262624', logging: false, useCORS: true });
      const blob: Blob | null = await new Promise(res => canvas.toBlob(res, 'image/png'));
      if (!blob) throw new Error('render failed');
      const file = new File([blob], 'dieticianai-weekly-report.png', { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My weekly nutrition report' });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      if (!(e instanceof Error) || e.name !== 'AbortError') console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-10 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-1)' }}>
            Insights
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>Your nutrition trends at a glance</p>
        </div>
        {hasData && (
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors disabled:opacity-50"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
            {exporting ? <Loader2 size={13} className="animate-spin" /> : <Share2 size={13} style={{ color: 'var(--accent)' }} />}
            {exporting ? 'Rendering…' : 'Share report'}
          </button>
        )}
      </div>

      {/* Off-screen capture target for the weekly report image */}
      <div style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none', opacity: 0 }} aria-hidden>
        <WeeklyReportCard ref={cardRef} data={reportData} />
      </div>

      {!hasData ? (
        <div className="py-20 text-center rounded-xl border"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <p className="text-3xl mb-3">📊</p>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-1)' }}>No data yet</p>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>Scan meals and log them to see your insights here</p>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border flex items-center gap-3"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,107,53,0.12)' }}>
                <Flame size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none" style={{ color: 'var(--text-1)' }}>{streak}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>day streak</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="p-4 rounded-xl border flex items-center gap-3"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(16,185,129,0.12)' }}>
                <Award size={20} style={{ color: '#10b981' }} />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none" style={{ color: 'var(--text-1)' }}>{gradeAMeals}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Grade A meals</p>
              </div>
            </motion.div>
          </div>

          {/* 30-day calorie chart */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="p-5 rounded-xl border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>30-DAY CALORIES</p>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-3)' }}>
                <div className="w-4 h-px border-t border-dashed" style={{ borderColor: 'var(--text-3)' }} />
                {targets.calories.toLocaleString()} target
              </div>
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calData} barSize={6} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" tickFormatter={d => formatDateShort(String(d))}
                    tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}
                    interval={4} />
                  <YAxis hide domain={[0, calMax * 1.1]} />
                  <Tooltip
                    formatter={v => [typeof v === 'number' ? `${v.toLocaleString()} kcal` : v, 'Calories']}
                    labelFormatter={l => formatDateShort(String(l))}
                    contentStyle={{ background: 'var(--surface-2)', border: 'none', borderRadius: '8px', fontSize: '11px', color: 'var(--text-1)' }}
                    cursor={{ fill: 'var(--border)' }}
                  />
                  <Bar dataKey="calories" radius={[3, 3, 0, 0]}>
                    {calData.map(d => (
                      <Cell key={d.date}
                        fill={d.calories === 0 ? 'var(--surface-2)' : d.calories >= targets.calories ? '#ef4444' : 'var(--accent)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 7-day macro averages */}
          {(avgMacros.protein > 0 || avgMacros.carbs > 0) && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="p-5 rounded-xl border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-3)' }}>
                7-DAY MACRO AVERAGES
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Protein', avg: avgMacros.protein, target: targets.protein, color: '#3b82f6' },
                  { label: 'Carbs',   avg: avgMacros.carbs,   target: targets.carbs,   color: '#f59e0b' },
                  { label: 'Fat',     avg: avgMacros.fat,     target: targets.fat,     color: '#f43f5e' },
                ].map(m => {
                  const pct = Math.min(100, m.target > 0 ? Math.round((m.avg / m.target) * 100) : 0);
                  return (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{m.label}</p>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                          {m.avg}g avg / {m.target}g target
                        </p>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--surface-2)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: m.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Grade distribution */}
          {gradeDist.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
              className="p-5 rounded-xl border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-3)' }}>
                GRADE DISTRIBUTION (ALL TIME)
              </p>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDist} barSize={36} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="grade"
                      tick={{ fontSize: 12, fill: 'var(--text-3)', fontWeight: 700 }}
                      axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      formatter={v => [v, 'Meals']}
                      contentStyle={{ background: 'var(--surface-2)', border: 'none', borderRadius: '8px', fontSize: '11px', color: 'var(--text-1)' }}
                      cursor={{ fill: 'var(--border)' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {gradeDist.map(d => (
                        <Cell key={d.grade} fill={GRADE_COLORS[d.grade]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Top dishes */}
          {topDishes.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="p-5 rounded-xl border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-3)' }}>TOP DISHES</p>
              <div className="space-y-3">
                {topDishes.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold w-4 text-center shrink-0"
                      style={{ color: 'var(--text-3)' }}>{i + 1}</span>
                    <p className="text-sm font-medium flex-1 truncate"
                      style={{ color: 'var(--text-1)' }}>{d.name}</p>
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0"
                      style={{ background: GRADE_COLORS[d.grade] }}>{d.grade}</div>
                    <p className="text-xs shrink-0 text-right w-14"
                      style={{ color: 'var(--text-3)' }}>
                      {d.count}× scan{d.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
