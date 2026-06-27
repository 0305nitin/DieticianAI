'use client';
import { motion } from 'framer-motion';
import { NutriGrade as NGType } from '@/lib/types';

const config: Record<NGType, { bg: string; label: string }> = {
  A: { bg: '#1db954', label: 'Excellent' },
  B: { bg: '#22c55e', label: 'Good' },
  C: { bg: '#f59e0b', label: 'Fair' },
  D: { bg: '#f97316', label: 'Poor' },
  E: { bg: '#ef4444', label: 'Unhealthy' },
};

export default function NutriGrade({ grade }: { grade: NGType }) {
  const { bg, label } = config[grade];
  return (
    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
      className="flex flex-col items-center gap-1">
      <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: bg, boxShadow: `0 8px 24px ${bg}55` }}>
        <span className="text-3xl font-black text-white">{grade}</span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: bg }}>{label}</span>
    </motion.div>
  );
}
