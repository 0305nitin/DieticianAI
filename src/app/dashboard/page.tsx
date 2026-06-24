'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Camera, CalendarDays } from 'lucide-react';
import { useDailyMacros } from '@/hooks/useDailyMacros';
import MacroRings from '@/components/tracking/MacroRings';
import MealCard from '@/components/tracking/MealCard';
import WeeklyChart from '@/components/tracking/WeeklyChart';
import DailySummary from '@/components/tracking/DailySummary';
import FreemiumBadge from '@/components/ui/FreemiumBadge';

export default function DashboardPage() {
  const { macros, todayScans, weeklyCalories } = useDailyMacros();

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-10 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
            <CalendarDays size={12} />
            {new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <FreemiumBadge />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
        <DailySummary macros={macros} mealCount={todayScans.length} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <MacroRings macros={macros} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
        <WeeklyChart data={weeklyCalories} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Today&apos;s Meals</p>
          <Link
            href="/scan"
            className="flex items-center gap-1 text-xs text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 font-medium transition-colors"
          >
            <Camera size={12} />
            Add meal
          </Link>
        </div>

        {todayScans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <span className="text-4xl mb-3">🍽️</span>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">No meals logged today</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Scan your food to start tracking</p>
            <Link
              href="/scan"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors"
            >
              <Camera size={12} />
              Scan Now
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {todayScans.map((scan, i) => (
              <MealCard key={scan.id} scan={scan} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
