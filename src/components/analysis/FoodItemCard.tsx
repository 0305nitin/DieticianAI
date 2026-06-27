'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FoodItem } from '@/lib/types';
import { scaledItem } from '@/lib/nutrition';

interface Props { item: FoodItem; index: number; multiplier: number; }

export default function FoodItemCard({ item, index, multiplier }: Props) {
  const [open, setOpen] = useState(false);
  const s = scaledItem(item, multiplier);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl overflow-hidden border"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

      <button className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
        style={{ background: 'transparent' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        onClick={() => setOpen(o => !o)}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>{item.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>{item.portionEstimate}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{s.calories} kcal</span>
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-3)' }} />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'Protein', value: s.protein, color: '#3b82f6' },
              { label: 'Carbs',   value: s.carbs,   color: '#f59e0b' },
              { label: 'Fat',     value: s.fat,      color: '#f43f5e' },
            ].map(m => (
              <div key={m.label} className="rounded-lg p-2.5 text-center"
                style={{ background: 'var(--surface-2)' }}>
                <p className="text-sm font-bold mb-0.5" style={{ color: m.color }}>{m.value}g</p>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{m.label}</p>
              </div>
            ))}
          </div>
          {item.hiddenIngredients.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider self-center mr-1" style={{ color: 'var(--text-3)' }}>
                Hidden:
              </span>
              {item.hiddenIngredients.map(ing => (
                <span key={ing} className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(255,107,53,0.12)', color: 'var(--accent)' }}>
                  {ing}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
