'use client';
import { useState, useEffect } from 'react';
import { DailyMacros, ScanResult } from '@/lib/types';
import { getDailyLog, getScanById, getWeeklyLogs } from '@/lib/storage';
import { scaledNutrition, sumNutrition } from '@/lib/nutrition';

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

export function useDailyMacros() {
  const [macros, setMacros] = useState<DailyMacros>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [todayScans, setTodayScans] = useState<ScanResult[]>([]);
  const [weeklyCalories, setWeeklyCalories] = useState<{ date: string; calories: number }[]>([]);

  useEffect(() => {
    const today = getTodayString();
    const log = getDailyLog(today);
    const scans = log.scanIds.map((id) => getScanById(id)).filter(Boolean) as ScanResult[];
    setTodayScans(scans);

    const totals = sumNutrition(
      scans.map((s) => scaledNutrition(s.totalNutrition, s.portionMultiplier))
    );
    setMacros({
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
    });

    const weekly = getWeeklyLogs().map((log) => {
      const dayScans = log.scanIds
        .map((id) => getScanById(id))
        .filter(Boolean) as ScanResult[];
      const dayTotals = sumNutrition(
        dayScans.map((s) => scaledNutrition(s.totalNutrition, s.portionMultiplier))
      );
      return { date: log.date, calories: dayTotals.calories };
    });
    setWeeklyCalories(weekly);
  }, []);

  return { macros, todayScans, weeklyCalories };
}
