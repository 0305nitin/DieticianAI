'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Trash2, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useScans } from '@/hooks/useScans';
import { deleteScan } from '@/lib/storage';
import { scaledNutrition, GRADE_COLORS } from '@/lib/nutrition';
import { NutriGrade, ScanResult } from '@/lib/types';

const GRADES: NutriGrade[] = ['A', 'B', 'C', 'D', 'E'];
type DateFilter = 'all' | 'today' | 'week';

function groupByDate(scans: ScanResult[]): [string, ScanResult[]][] {
  const map = new Map<string, ScanResult[]>();
  for (const scan of scans) {
    const key = new Date(scan.timestamp).toLocaleDateString('en-SG', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(scan);
  }
  return Array.from(map.entries());
}

export default function HistoryPage() {
  const router = useRouter();
  const { scans, refreshScans } = useScans();
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<NutriGrade | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filtered = useMemo(() => {
    return scans.filter(s => {
      if (gradeFilter !== 'all' && s.nutriGrade !== gradeFilter) return false;
      const d = new Date(s.timestamp).toISOString().split('T')[0];
      if (dateFilter === 'today' && d !== today) return false;
      if (dateFilter === 'week' && d < weekAgo) return false;
      if (search && !s.dishName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [scans, gradeFilter, dateFilter, search, today, weekAgo]);

  const grouped = groupByDate(filtered);

  const handleDelete = (id: string) => {
    deleteScan(id);
    refreshScans();
    setDeletingId(null);
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-10 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>Scan History</h1>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>{scans.length} total scan{scans.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-3)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search dish name…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
        />
      </div>

      {/* Filters */}
      <div className="space-y-2.5">
        <div className="flex gap-1.5 flex-wrap">
          {([['all', 'All time'], ['today', 'Today'], ['week', 'This week']] as [DateFilter, string][]).map(([v, label]) => (
            <button key={v} onClick={() => setDateFilter(v)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: dateFilter === v ? 'var(--accent)' : 'var(--surface-2)',
                color: dateFilter === v ? '#fff' : 'var(--text-2)',
              }}>{label}</button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setGradeFilter('all')}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
            style={{
              background: gradeFilter === 'all' ? 'var(--accent)' : 'var(--surface-2)',
              color: gradeFilter === 'all' ? '#fff' : 'var(--text-2)',
            }}>All grades</button>
          {GRADES.map(g => (
            <button key={g} onClick={() => setGradeFilter(g)}
              className="px-3 py-1 rounded-full text-xs font-bold transition-all"
              style={{
                background: gradeFilter === g ? GRADE_COLORS[g] : 'var(--surface-2)',
                color: gradeFilter === g ? '#fff' : 'var(--text-2)',
              }}>Grade {g}</button>
          ))}
        </div>
      </div>

      <p className="text-xs" style={{ color: 'var(--text-3)' }}>
        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-xl border"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <p className="text-2xl mb-3">🍽️</p>
          <p className="text-sm mb-1" style={{ color: 'var(--text-1)' }}>No scans found</p>
          <p className="text-xs mb-5" style={{ color: 'var(--text-3)' }}>
            {scans.length === 0 ? 'Scan a meal to start tracking' : 'Try adjusting your filters'}
          </p>
          {scans.length === 0 && (
            <Link href="/scan" className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
              style={{ background: 'var(--accent)' }}>Scan a meal</Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, group]) => (
            <div key={date}>
              <p className="text-[11px] font-semibold mb-2.5 tracking-wide"
                style={{ color: 'var(--text-3)' }}>{date.toUpperCase()}</p>
              <div className="space-y-2">
                {group.map((scan, i) => {
                  const n = scaledNutrition(scan.totalNutrition, scan.portionMultiplier);
                  const time = new Date(scan.timestamp).toLocaleTimeString('en-SG', {
                    hour: '2-digit', minute: '2-digit',
                  });
                  const isDeleting = deletingId === scan.id;
                  return (
                    <motion.div key={scan.id}
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="rounded-xl border overflow-hidden"
                      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

                      <Link href={`/results/${scan.id}`}
                        className="flex items-center gap-3 p-3"
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0"
                          style={{ background: 'var(--surface-2)' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={scan.imageDataUrl} alt={scan.dishName}
                            className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate"
                            style={{ color: 'var(--text-1)' }}>{scan.dishName}</p>
                          <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                            {time} · {scan.items.length} item{scan.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0 mr-2">
                          <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{n.calories}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>kcal</p>
                        </div>
                        <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-black text-white shrink-0"
                          style={{ background: GRADE_COLORS[scan.nutriGrade] }}>{scan.nutriGrade}</div>
                      </Link>

                      {/* Delete row */}
                      <div className="flex items-center justify-between px-3 pb-2.5">
                        {isDeleting ? (
                          <div className="flex items-center gap-2 w-full">
                            <p className="text-xs flex-1" style={{ color: 'var(--text-2)' }}>
                              Delete this scan?
                            </p>
                            <button onClick={() => handleDelete(scan.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
                              style={{ background: '#ef4444' }}>
                              <Check size={10} /> Delete
                            </button>
                            <button onClick={() => setDeletingId(null)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                              style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                              <X size={10} /> Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <span />
                            <button onClick={() => setDeletingId(scan.id)}
                              className="p-1 rounded-lg opacity-30 hover:opacity-80 transition-opacity"
                              style={{ color: '#ef4444' }}>
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
