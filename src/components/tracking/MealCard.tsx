'use client';
import Link from 'next/link';
import { ScanResult } from '@/lib/types';
import { scaledNutrition } from '@/lib/nutrition';

const gradeColor: Record<string, string> = {
  A: '#1db954', B: '#22c55e', C: '#f59e0b', D: '#f97316', E: '#ef4444',
};

export default function MealCard({ scan }: { scan: ScanResult; index?: number }) {
  const n = scaledNutrition(scan.totalNutrition, scan.portionMultiplier);
  const time = new Date(scan.timestamp).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });

  return (
    <Link href={`/results/${scan.id}`}
      className="group flex items-center gap-3 p-3 rounded-xl border transition-colors"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}>

      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--surface-2)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={scan.imageDataUrl} alt={scan.dishName} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate mb-0.5" style={{ color: 'var(--text-1)' }}>{scan.dishName}</p>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>{time} · {scan.items.length} items</p>
      </div>

      {/* Stats */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{n.calories}</p>
        <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>kcal</p>
      </div>

      {/* Grade */}
      <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-black text-white shrink-0"
        style={{ background: gradeColor[scan.nutriGrade] }}>
        {scan.nutriGrade}
      </div>
    </Link>
  );
}
