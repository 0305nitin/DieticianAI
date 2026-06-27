'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Check } from 'lucide-react';
import { useFreemium } from '@/hooks/useFreemium';

interface Props {
  open: boolean;
  onClose: () => void;
}

const perks = [
  'Unlimited scans every day',
  'Advanced ingredient deep-dive',
  'Weekly nutrition trends',
  'Export PDF meal reports',
  'Priority AI insights',
];

export default function PremiumModal({ open, onClose }: Props) {
  const { upgradeToPremium } = useFreemium();

  const handleUpgrade = () => {
    upgradeToPremium();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* accent top bar */}
            <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: 'var(--accent)' }} />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <X size={14} />
            </button>

            <div className="p-6 pt-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent)' }}>
                <Zap size={22} color="#fff" />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>
                Unlock Premium
              </h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-3)' }}>
                You&apos;ve used your 3 free scans today. Upgrade for unlimited access.
              </p>

              <ul className="space-y-2.5 text-left mb-6">
                {perks.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-2)' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(29,185,84,0.15)' }}>
                      <Check size={11} color="#1db954" />
                    </div>
                    {p}
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <button
                  onClick={handleUpgrade}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  Upgrade — $4.99 / month
                </button>
                <button
                  onClick={handleUpgrade}
                  className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-2)', background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  $39.99 / year — Save 33%
                </button>
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-3)' }}>Cancel anytime · No hidden fees</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
