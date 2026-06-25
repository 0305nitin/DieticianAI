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
  'Priority Hawker Uncle insights',
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center
                text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={14} />
            </button>

            <div className="p-6 pt-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg">
                <Zap size={26} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Unlock Premium
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                You&apos;ve used your 3 free scans today. Upgrade for unlimited access.
              </p>

              <ul className="space-y-2.5 text-left mb-6">
                {perks.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-emerald-500" />
                    </div>
                    {p}
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <button
                  onClick={handleUpgrade}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500
                    text-white font-semibold text-sm shadow-lg hover:shadow-orange-500/20 transition-all"
                >
                  Upgrade — $4.99/month
                </button>
                <button
                  onClick={handleUpgrade}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700
                    text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  $39.99/year — Save 33%
                </button>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">Cancel anytime • No hidden fees</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
