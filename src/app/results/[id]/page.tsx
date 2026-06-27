'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, BookmarkPlus, Check, AlertTriangle } from 'lucide-react';
import { getScanById, addScanToDaily, updateScan } from '@/lib/storage';
import { scaledNutrition } from '@/lib/nutrition';
import { ScanResult } from '@/lib/types';
import NutriGrade from '@/components/analysis/NutriGrade';
import HawkerUncle from '@/components/analysis/HawkerUncle';
import FoodItemCard from '@/components/analysis/FoodItemCard';
import PortionAdjuster from '@/components/analysis/PortionAdjuster';
import MacroDonut from '@/components/analysis/MacroDonut';
import ComponentBreakdown from '@/components/analysis/ComponentBreakdown';

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [logged, setLogged] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const s = getScanById(id);
    if (!s) { setNotFound(true); return; }
    setScan(s);
    setMultiplier(s.portionMultiplier);
  }, [id]);

  if (notFound) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <AlertTriangle size={36} className="mx-auto mb-4" style={{ color: 'var(--accent)' }} />
        <p className="text-sm font-medium mb-5" style={{ color: 'var(--text-2)' }}>Scan not found</p>
        <button
          onClick={() => router.push('/scan')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          New Scan
        </button>
      </div>
    );
  }

  if (!scan) return null;

  const scaled = scaledNutrition(scan.totalNutrition, multiplier);

  const handleMultiplierChange = (v: number) => {
    setMultiplier(v);
    updateScan(id, { portionMultiplier: v });
  };

  const handleAddToLog = () => {
    addScanToDaily(scan.id);
    updateScan(id, { portionMultiplier: multiplier });
    setLogged(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate" style={{ color: 'var(--text-1)' }}>{scan.dishName}</h1>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>
            {new Date(scan.timestamp).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Image + Grade */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={scan.imageDataUrl} alt={scan.dishName} className="w-full max-h-56 object-cover" />
        <div className="absolute top-3 right-3">
          <NutriGrade grade={scan.nutriGrade} />
        </div>
        <div className="absolute bottom-0 inset-x-0 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
          <p className="text-white font-semibold text-sm">{scan.dishName}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {scaled.calories} kcal · {scan.items.length} item{scan.items.length !== 1 ? 's' : ''} identified
          </p>
        </div>
      </motion.div>

      {/* Hawker Uncle commentary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <HawkerUncle comment={scan.hawkerUncleComment} />
      </motion.div>

      {/* Portion Adjuster */}
      <PortionAdjuster value={multiplier} onChange={handleMultiplierChange} />

      {/* Macro Donut */}
      <MacroDonut nutrition={scan.totalNutrition} multiplier={multiplier} />

      {/* Extended nutrition */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="p-5 rounded-xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-3)' }}>NUTRITION DETAILS</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Fiber', value: scaled.fiber, color: '#1db954' },
            { label: 'Sugar', value: scaled.sugar, color: '#f59e0b' },
            { label: 'Sat. Fat', value: scaled.saturatedFat, color: '#ef4444' },
          ].map((m) => (
            <div key={m.label} className="rounded-lg p-3 text-center"
              style={{ background: 'var(--surface-2)' }}>
              <p className="text-sm font-bold mb-0.5" style={{ color: m.color }}>{m.value}g</p>
              <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{m.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Hidden ingredients */}
      <ComponentBreakdown items={scan.items} warnings={scan.healthWarnings} />

      {/* Individual food items */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-3)' }}>
          IDENTIFIED ITEMS ({scan.items.length})
        </p>
        <div className="space-y-2">
          {scan.items.map((item, i) => (
            <FoodItemCard key={i} item={item} index={i} multiplier={multiplier} />
          ))}
        </div>
      </div>

      {/* Sticky add to log */}
      <div className="fixed bottom-0 inset-x-0 px-4 pb-6 pt-3"
        style={{ background: 'linear-gradient(to top, var(--bg) 70%, transparent)' }}>
        <div className="max-w-xl mx-auto">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToLog}
            disabled={logged}
            className="w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            style={logged
              ? { background: '#1db954', color: '#fff' }
              : { background: 'var(--accent)', color: '#fff' }
            }
          >
            {logged
              ? <><Check size={15} /> Added to Today&apos;s Log</>
              : <><BookmarkPlus size={15} /> Add to Today&apos;s Log</>
            }
          </motion.button>
        </div>
      </div>
    </div>
  );
}
