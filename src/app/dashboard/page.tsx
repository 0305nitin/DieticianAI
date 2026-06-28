'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Camera, User } from 'lucide-react';
import { useDailyMacros } from '@/hooks/useDailyMacros';
import { useProfile } from '@/hooks/useProfile';
import { calculateCalorieGoal, getMacroTargets } from '@/lib/bmr';
import { DAILY_TARGETS, DailyMacros } from '@/lib/types';
import MacroRings from '@/components/tracking/MacroRings';
import MealCard from '@/components/tracking/MealCard';
import WeeklyChart from '@/components/tracking/WeeklyChart';
import DailySummary from '@/components/tracking/DailySummary';
import FreemiumBadge from '@/components/ui/FreemiumBadge';

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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-8">
        <WeeklyChart data={weeklyCalories} calorieTarget={targets.calories} />
      </motion.div>

      {/* Today's meals */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
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
