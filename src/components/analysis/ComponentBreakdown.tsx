'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, EyeOff, AlertTriangle, Ban } from 'lucide-react';
import { FoodItem } from '@/lib/types';
import { getProfile } from '@/lib/storage';
import { checkDietaryConflicts } from '@/lib/dietary';

interface Props {
  items: FoodItem[];
  warnings: string[];
  dishName?: string;
}

export default function ComponentBreakdown({ items, warnings, dishName }: Props) {
  const [open, setOpen] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

  useEffect(() => {
    const prefs = getProfile()?.dietaryPrefs;
    setConflicts(checkDietaryConflicts({ items, warnings, dishName }, prefs));
  }, [items, warnings, dishName]);

  const allHidden = items.flatMap((item) =>
    item.hiddenIngredients.map((ing) => ({ item: item.name, ingredient: ing }))
  );

  if (allHidden.length === 0 && warnings.length === 0 && conflicts.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Dietary conflict banner */}
      {conflicts.length > 0 && (
        <div className="rounded-xl border p-3 space-y-1.5"
          style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}>
          <div className="flex items-center gap-2">
            <Ban size={13} style={{ color: '#ef4444' }} />
            <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>
              Doesn&apos;t match your dietary preferences
            </p>
          </div>
          {conflicts.map((c, i) => (
            <p key={i} className="text-xs pl-5" style={{ color: '#ef4444' }}>{c}</p>
          ))}
        </div>
      )}

    {(allHidden.length > 0 || warnings.length > 0) && (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
        style={{ background: 'var(--surface)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,107,53,0.12)' }}>
          <EyeOff size={14} style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            {allHidden.length} Hidden Ingredient{allHidden.length !== 1 ? 's' : ''} Detected
          </p>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>Oils, sauces, and additives often missed</p>
        </div>
        <ChevronDown size={14} className={`transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-3)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1" style={{ background: 'var(--surface)' }}>
              <div className="border-t mb-3" style={{ borderColor: 'var(--border)' }} />
              <div className="space-y-2">
                {allHidden.map((h, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>{h.item}</span>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,107,53,0.12)', color: 'var(--accent)' }}>
                      {h.ingredient}
                    </span>
                  </div>
                ))}

                {warnings.length > 0 && (
                  <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-3)' }}>
                      Health Warnings
                    </p>
                    {warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle size={11} className="mt-0.5 shrink-0" style={{ color: '#ef4444' }} />
                        <p className="text-xs" style={{ color: '#ef4444' }}>{w}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    )}
    </div>
  );
}
