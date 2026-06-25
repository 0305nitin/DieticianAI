'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, EyeOff } from 'lucide-react';
import { FoodItem } from '@/lib/types';

interface Props {
  items: FoodItem[];
  warnings: string[];
}

export default function ComponentBreakdown({ items, warnings }: Props) {
  const [open, setOpen] = useState(false);
  const allHidden = items.flatMap((item) =>
    item.hiddenIngredients.map((ing) => ({ item: item.name, ingredient: ing }))
  );

  if (allHidden.length === 0 && warnings.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-500/20 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 text-left hover:bg-amber-100 dark:hover:bg-amber-500/15 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
          <EyeOff size={14} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            {allHidden.length} Hidden Ingredient{allHidden.length !== 1 ? 's' : ''} Detected
          </p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70">The stuff western apps miss</p>
        </div>
        <ChevronDown
          size={14}
          className={`text-amber-500 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-white dark:bg-slate-900"
          >
            <div className="p-4 space-y-2">
              {allHidden.map((h, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{h.item}</span>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10">
                    {h.ingredient}
                  </span>
                </div>
              ))}

              {warnings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Health Warnings</p>
                  {warnings.map((w, i) => (
                    <p key={i} className="text-xs text-rose-500 dark:text-rose-400">⚠ {w}</p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
