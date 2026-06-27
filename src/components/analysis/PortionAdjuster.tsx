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
    <div className="p-5 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Portion Size</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Adjust to match how much you ate</p>
        </div>
        <motion.div
          key={value}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="px-3 py-1 rounded-lg text-sm font-bold"
          style={{ background: 'rgba(255,107,53,0.12)', color: 'var(--accent)' }}
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
        <Slider.Track className="relative grow rounded-full h-1" style={{ background: 'var(--surface-2)' }}>
          <Slider.Range className="absolute rounded-full h-full" style={{ background: 'var(--accent)' }} />
        </Slider.Track>
        <Slider.Thumb
          className="block w-4 h-4 rounded-full shadow focus:outline-none cursor-grab active:cursor-grabbing"
          style={{ background: 'var(--accent)', border: '2px solid var(--bg)' }}
        />
      </Slider.Root>

      <div className="flex justify-between mt-3">
        {[0.5, 1, 1.5, 2].map((v) => (
          <span key={v} className="text-[10px] font-medium"
            style={{ color: value === v ? 'var(--accent)' : 'var(--text-3)' }}>
            {v}×
          </span>
        ))}
      </div>
    </div>
  );
}
