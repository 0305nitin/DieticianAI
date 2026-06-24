'use client';
import { useState, useEffect, useCallback } from 'react';
import { isPremium, setPremium } from '@/lib/storage';

const FREE_SCANS_KEY = 'hawkersense_free_scans';
const FREE_LIMIT = 3;

interface FreemiumState {
  count: number;
  date: string;
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

export function useFreemium() {
  const [scansUsed, setScansUsed] = useState(0);
  const [premium, setPremiumState] = useState(false);

  useEffect(() => {
    setPremiumState(isPremium());
    const today = getTodayString();
    try {
      const raw = localStorage.getItem(FREE_SCANS_KEY);
      if (raw) {
        const state: FreemiumState = JSON.parse(raw);
        setScansUsed(state.date === today ? state.count : 0);
      }
    } catch {
      setScansUsed(0);
    }
  }, []);

  const canScan = premium || scansUsed < FREE_LIMIT;
  const scansRemaining = premium ? Infinity : Math.max(0, FREE_LIMIT - scansUsed);

  const incrementScan = useCallback(() => {
    if (premium) return;
    const today = getTodayString();
    const newCount = scansUsed + 1;
    setScansUsed(newCount);
    localStorage.setItem(FREE_SCANS_KEY, JSON.stringify({ count: newCount, date: today }));
  }, [scansUsed, premium]);

  const upgradeToPremium = useCallback(() => {
    setPremium(true);
    setPremiumState(true);
  }, []);

  return { canScan, scansUsed, scansRemaining, isPremium: premium, incrementScan, upgradeToPremium, FREE_LIMIT };
}
