'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, BookmarkPlus, Check, AlertTriangle } from 'lucide-react';
import { getScanById } from '@/lib/storage';
import { addScanToDaily, updateScan } from '@/lib/storage';
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
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertTriangle size={40} className="text-amber-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-300 font-medium mb-4">Scan not found</p>
        <button onClick={() => router.push('/scan')} className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium">
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
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">{scan.dishName}</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {new Date(scan.timestamp).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={scan.imageDataUrl} alt={scan.dishName} className="w-full max-h-64 object-cover" />
        <div className="absolute top-3 right-3">
          <NutriGrade grade={scan.nutriGrade} />
        </div>
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-white font-semibold text-sm">{scan.dishName}</p>
          <p className="text-white/70 text-xs">{scaled.calories} kcal · {scan.items.length} item{scan.items.length !== 1 ? 's' : ''} identified</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4"
      >
        <HawkerUncle comment={scan.hawkerUncleComment} />
      </motion.div>

      <PortionAdjuster value={multiplier} onChange={handleMultiplierChange} />

      <MacroDonut nutrition={scan.totalNutrition} multiplier={multiplier} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4"
      >
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Nutrition Details</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Fiber', value: scaled.fiber, unit: 'g', color: 'text-green-500' },
            { label: 'Sugar', value: scaled.sugar, unit: 'g', color: 'text-pink-500' },
            { label: 'Sat. Fat', value: scaled.saturatedFat, unit: 'g', color: 'text-red-500' },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
              <p className={`text-base font-bold ${m.color}`}>{m.value}{m.unit}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <ComponentBreakdown items={scan.items} warnings={scan.healthWarnings} />

      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Identified Food Items ({scan.items.length})
        </p>
        <div className="space-y-2">
          {scan.items.map((item, i) => (
            <FoodItemCard key={i} item={item} index={i} multiplier={multiplier} />
          ))}
        </div>
      </div>

      <div className="sticky bottom-4 pt-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAddToLog}
          disabled={logged}
          className={`w-full py-4 rounded-xl font-semibold text-sm shadow-xl transition-all flex items-center justify-center gap-2
            ${logged
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white shadow-orange-500/25'
            }`}
        >
          {logged ? <><Check size={16} /> Added to Today&apos;s Log</> : <><BookmarkPlus size={16} /> Add to Today&apos;s Log</>}
        </motion.button>
      </div>
    </div>
  );
}
