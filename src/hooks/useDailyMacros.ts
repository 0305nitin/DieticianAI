'use client';
import { useState, useEffect, useCallback } from 'react';
import { DailyMacros, ScanResult } from '@/lib/types';
import { getAllScans, getDailyLog, getWeeklyLogs } from '@/lib/storage';
import { scaledNutrition, sumNutrition } from '@/lib/nutrition';

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

export function useDailyMacros() {
  const [macros, setMacros] = useState<DailyMacros>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [todayScans, setTodayScans] = useState<ScanResult[]>([]);
  const [weeklyCalories, setWeeklyCalories] = useState<{ date: string; calories: number }[]>([]);

  const refresh = useCallback(() => {
    // Resolve scan IDs against a single map so lookups stay O(n) overall.
    const scanMap = new Map(getAllScans().map((s) => [s.id, s]));
    const resolve = (ids: string[]) =>
      ids.map((id) => scanMap.get(id)).filter(Boolean) as ScanResult[];

    const scans = resolve(getDailyLog(getTodayString()).scanIds);
    setTodayScans(scans);

    const totals = sumNutrition(scans.map((s) => scaledNutrition(s.totalNutrition, s.portionMultiplier)));
    setMacros({ calories: totals.calories, protein: totals.protein, carbs: totals.carbs, fat: totals.fat });

    setWeeklyCalories(
      getWeeklyLogs().map((log) => {
        const dayTotals = sumNutrition(resolve(log.scanIds).map((s) => scaledNutrition(s.totalNutrition, s.portionMultiplier)));
        return { date: log.date, calories: dayTotals.calories };
      })
    );
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { macros, todayScans, weeklyCalories, refresh };
}
