'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Camera, User, ChefHat } from 'lucide-react';
import { useDailyMacros } from '@/hooks/useDailyMacros';
import { useProfile } from '@/hooks/useProfile';
import { calculateCalorieGoal, getMacroTargets } from '@/lib/bmr';
import { DAILY_TARGETS, DailyMacros } from '@/lib/types';
import { suggestRecipes } from '@/lib/recipes';
import MacroRings from '@/components/tracking/MacroRings';
import MealCard from '@/components/tracking/MealCard';
import WeeklyChart from '@/components/tracking/WeeklyChart';
import DailySummary from '@/components/tracking/DailySummary';
import FreemiumBadge from '@/components/ui/FreemiumBadge';

const gradeColor: Record<string, string> = {
  A: '#10b981', B: '#22c55e', C: '#eab308', D: '#f97316', E: '#ef4444',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { macros, todayScans, weeklyCalories } = useDailyMacros();
  const { profile } = useProfile();

  const targets: DailyMacros = profile
    ? getMacroTargets(calculateCalorieGoal(profile), profile.goal)
    : DAILY_TARGETS;

  const remainingCalories = Math.max(0, targets.calories - macros.calories);
  const suggestions = suggestRecipes(remainingCalories, profile?.goal);

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-3)' }}>
            {new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
            {getGreeting()}{profile?.name ? `, ${profile.name}` : ''}
          </h1>
        </div>
        <FreemiumBadge />
      </div>

      {/* Profile prompt if no profile set */}
      {!profile && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl border flex items-center gap-3"
          style={{ background: 'rgba(255,107,53,0.06)', borderColor: 'rgba(255,107,53,0.2)' }}>
          <User size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Set up your profile</p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>Add height, weight & goal to get personalised calorie targets</p>
          </div>
          <Link href="/profile"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
            style={{ background: 'var(--accent)' }}>
            Set up
          </Link>
        </motion.div>
      )}

      {/* Top row: summary + macro rings */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <DailySummary macros={macros} mealCount={todayScans.length} targets={targets} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <MacroRings macros={macros} targets={targets} />
        </motion.div>
      </div>

      {/* Weekly chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-4">
        <WeeklyChart data={weeklyCalories} calorieTarget={targets.calories} />
      </motion.div>

      {/* Meal suggester */}
      {suggestions.length > 0 && remainingCalories >= 100 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="mb-8 p-5 rounded-xl border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ChefHat size={15} style={{ color: 'var(--accent)' }} />
              <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>
                WHAT TO EAT NEXT
              </p>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              {remainingCalories.toLocaleString()} kcal left
            </p>
          </div>
          <div className="space-y-2">
            {suggestions.map(r => (
              <Link key={r.id} href="/recipes"
                className="flex items-center gap-3 p-2.5 rounded-lg transition-colors"
                style={{ background: 'var(--surface-2)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-2)')}>
                <span className="text-xl shrink-0">{r.imageEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>{r.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{r.calories} kcal · {r.cuisine}</p>
                </div>
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0"
                  style={{ background: gradeColor[r.grade] }}>{r.grade}</div>
              </Link>
            ))}
          </div>
          <Link href="/recipes"
            className="mt-3 block text-center text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}>
            See all recipes →
          </Link>
        </motion.div>
      )}

      {/* Today's meals */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
            Today&apos;s meals
          </h2>
          <Link href="/scan"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}>
            <Camera size={12} />
            Add meal
          </Link>
        </div>

        {todayScans.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center rounded-xl border"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-1)' }}>Nothing logged yet</p>
            <p className="text-xs mb-5" style={{ color: 'var(--text-3)' }}>Scan a meal to start tracking your nutrition</p>
            <Link href="/scan"
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white"
              style={{ background: 'var(--accent)' }}>
              <Camera size={12} /> Scan now
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {todayScans.map((scan, i) => (
              <MealCard key={scan.id} scan={scan} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
