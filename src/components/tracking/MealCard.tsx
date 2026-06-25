'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScanResult } from '@/lib/types';
import { scaledNutrition } from '@/lib/nutrition';
import { ChevronRight } from 'lucide-react';

const gradeColors: Record<string, string> = {
  A: 'bg-emerald-500',
  B: 'bg-green-500',
  C: 'bg-yellow-500',
  D: 'bg-orange-500',
  E: 'bg-red-500',
};

interface Props {
  scan: ScanResult;
  index: number;
}

export default function MealCard({ scan, index }: Props) {
  const n = scaledNutrition(scan.totalNutrition, scan.portionMultiplier);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link
        href={`/results/${scan.id}`}
        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60
          bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
      >
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={scan.imageDataUrl} alt={scan.dishName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{scan.dishName}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            P {n.protein}g · C {n.carbs}g · F {n.fat}g
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-orange-500 dark:text-orange-400">{n.calories}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">kcal</p>
          </div>
          <div className={`w-6 h-6 rounded-md ${gradeColors[scan.nutriGrade]} flex items-center justify-center text-white text-[10px] font-black`}>
            {scan.nutriGrade}
          </div>
          <ChevronRight size={13} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}
