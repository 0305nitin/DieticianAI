'use client';
import { useState, useEffect, useCallback } from 'react';
import { ModelChoice, MODEL_DAILY_LIMITS } from '@/lib/types';
import { getModelUsage, incrementModelUsage } from '@/lib/storage';

export function useModelCredits() {
  const [usage, setUsage] = useState<Partial<Record<ModelChoice, number>>>({});

  useEffect(() => {
    const models: ModelChoice[] = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gpt-4o', 'claude-sonnet'];
    const u: Partial<Record<ModelChoice, number>> = {};
    models.forEach(m => { u[m] = getModelUsage(m); });
    setUsage(u);
  }, []);

  const canUseModel = useCallback((model: ModelChoice): boolean => {
    const limit = MODEL_DAILY_LIMITS[model];
    if (!Number.isFinite(limit)) return true;
    return (usage[model] ?? 0) < limit;
  }, [usage]);

  const creditsRemaining = useCallback((model: ModelChoice): number => {
    const limit = MODEL_DAILY_LIMITS[model];
    if (!Number.isFinite(limit)) return Infinity;
    return Math.max(0, limit - (usage[model] ?? 0));
  }, [usage]);

  const increment = useCallback((model: ModelChoice) => {
    incrementModelUsage(model);
    setUsage(prev => ({ ...prev, [model]: (prev[model] ?? 0) + 1 }));
  }, []);

  return { canUseModel, creditsRemaining, increment, usage };
}
