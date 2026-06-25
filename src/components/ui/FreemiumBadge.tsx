'use client';
import { Zap } from 'lucide-react';
import { useFreemium } from '@/hooks/useFreemium';

export default function FreemiumBadge() {
  const { scansUsed, scansRemaining, isPremium, FREE_LIMIT } = useFreemium();

  if (isPremium) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-white text-xs font-semibold shadow">
        <Zap size={11} />
        Premium
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
      <div className="flex gap-0.5">
        {Array.from({ length: FREE_LIMIT }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i < scansUsed ? 'bg-orange-400' : 'bg-slate-300 dark:bg-slate-600'}`}
          />
        ))}
      </div>
      <span>{scansRemaining} scan{scansRemaining !== 1 ? 's' : ''} left</span>
    </div>
  );
}
