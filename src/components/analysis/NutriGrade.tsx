'use client';
import { motion } from 'framer-motion';
import { NutriGrade as NGType } from '@/lib/types';
import { nutriGradeColor, nutriGradeLabel } from '@/lib/nutrition';

const gradeBg: Record<NGType, string> = {
  A: 'from-emerald-500 to-emerald-400',
  B: 'from-green-500 to-green-400',
  C: 'from-yellow-500 to-amber-400',
  D: 'from-orange-500 to-orange-400',
  E: 'from-red-500 to-red-400',
};

export default function NutriGrade({ grade }: { grade: NGType }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
      className="flex flex-col items-center gap-1"
    >
      <div
        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradeBg[grade]} flex items-center justify-center shadow-xl`}
        style={{ boxShadow: `0 12px 32px ${nutriGradeColor(grade)}44` }}
      >
        <span className="text-4xl font-black text-white">{grade}</span>
      </div>
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {nutriGradeLabel(grade)}
      </span>
    </motion.div>
  );
}
