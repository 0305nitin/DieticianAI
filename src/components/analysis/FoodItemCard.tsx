'use client';
import { motion } from 'framer-motion';
import { FoodItem } from '@/lib/types';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { scaledItem } from '@/lib/nutrition';

interface Props {
  item: FoodItem;
  index: number;
  multiplier: number;
}

export default function FoodItemCard({ item, index, multiplier }: Props) {
  const [open, setOpen] = useState(false);
  const scaled = scaledItem(item, multiplier);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 overflow-hidden"
    >
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-500/20 dark:to-amber-500/10 flex items-center justify-center text-lg shrink-0">
          🍽️
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{item.portionEstimate}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-bold text-orange-500 dark:text-orange-400">{scaled.calories} kcal</span>
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4"
        >
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Protein', value: scaled.protein, unit: 'g', color: 'text-blue-500' },
              { label: 'Carbs', value: scaled.carbs, unit: 'g', color: 'text-amber-500' },
              { label: 'Fat', value: scaled.fat, unit: 'g', color: 'text-rose-500' },
            ].map((m) => (
              <div key={m.label} className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2.5 text-center">
                <p className={`text-sm font-bold ${m.color}`}>{m.value}{m.unit}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{m.label}</p>
              </div>
            ))}
          </div>

          {item.hiddenIngredients.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-0.5">Hidden Ingredients</p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                  {item.hiddenIngredients.join(', ')}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
