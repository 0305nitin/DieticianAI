'use client';
import * as Slider from '@radix-ui/react-slider';
import { motion } from 'framer-motion';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

const labels: Record<number, string> = {
  0.5: 'Half',
  0.75: '¾',
  1: 'Full',
  1.25: '1¼×',
  1.5: '1½×',
  1.75: '1¾×',
  2: 'Double',
};

export default function PortionAdjuster({ value, onChange }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Portion Size</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Adjust to match how much you actually ate</p>
        </div>
        <motion.div
          key={value}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-bold"
        >
          {labels[value] ?? `${value}×`}
        </motion.div>
      </div>

      <Slider.Root
        min={0.5}
        max={2}
        step={0.25}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="relative flex items-center select-none touch-none w-full h-5"
      >
        <Slider.Track className="bg-slate-200 dark:bg-slate-700 relative grow rounded-full h-1.5">
          <Slider.Range className="absolute bg-gradient-to-r from-orange-500 to-amber-400 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-orange-400 rounded-full shadow-lg hover:shadow-orange-400/30 focus:outline-none cursor-grab active:cursor-grabbing transition-shadow" />
      </Slider.Root>

      <div className="flex justify-between mt-2">
        {[0.5, 1, 1.5, 2].map((v) => (
          <span key={v} className={`text-[10px] font-medium ${value === v ? 'text-orange-500' : 'text-slate-300 dark:text-slate-600'}`}>
            {v}×
          </span>
        ))}
      </div>
    </div>
  );
}
