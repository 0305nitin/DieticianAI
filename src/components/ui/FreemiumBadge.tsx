'use client';
import { Zap } from 'lucide-react';
import { useFreemium } from '@/hooks/useFreemium';

export default function FreemiumBadge() {
  const { scansUsed, scansRemaining, isPremium, FREE_LIMIT } = useFreemium();

  if (isPremium) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{ background: 'var(--accent)', color: '#fff' }}>
        <Zap size={10} />
        Premium
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
      <div className="flex gap-0.5">
        {Array.from({ length: FREE_LIMIT }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-colors"
            style={{ background: i < scansUsed ? 'var(--accent)' : 'var(--border)' }}
          />
        ))}
      </div>
      <span>{scansRemaining} left</span>
    </div>
  );
}
