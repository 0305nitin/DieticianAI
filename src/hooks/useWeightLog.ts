'use client';
import { useState, useEffect, useCallback } from 'react';
import { WeightEntry, getWeightLog, saveWeightEntry } from '@/lib/storage';

export function useWeightLog() {
  const [log, setLog] = useState<WeightEntry[]>([]);

  useEffect(() => { setLog(getWeightLog()); }, []);

  const addEntry = useCallback((kg: number) => {
    const today = new Date().toISOString().split('T')[0];
    saveWeightEntry({ date: today, kg });
    setLog(getWeightLog());
  }, []);

  return { log, addEntry };
}
