'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader2, X, Zap } from 'lucide-react';
import ScannerUpload from '@/components/scanner/ScannerUpload';
import ScannerCamera from '@/components/scanner/ScannerCamera';
import FreemiumBadge from '@/components/ui/FreemiumBadge';
import PremiumModal from '@/components/ui/PremiumModal';
import { useFreemium } from '@/hooks/useFreemium';
import { useScans } from '@/hooks/useScans';
import { generateId } from '@/lib/utils';
import { ScanResult } from '@/lib/types';

type Tab = 'upload' | 'camera';

const loadingMessages = [
  'Aiyah, uncle analyzing lah...',
  'Spotting hidden ingredients...',
  'Calculating macros...',
  'Checking for coconut milk...',
  'Hawker Uncle judging your choices...',
];

export default function ScanPage() {
  const router = useRouter();
  const { canScan, incrementScan } = useFreemium();
  const { addScan } = useScans();
  const [tab, setTab] = useState<Tab>('upload');
  const [preview, setPreview] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [error, setError] = useState('');
  const [showPremium, setShowPremium] = useState(false);

  const handleImage = useCallback((f: File, p: string) => {
    setFile(f);
    setPreview(p);
    setError('');
  }, []);

  const clearImage = () => {
    setFile(null);
    setPreview('');
    setError('');
  };

  const analyze = async () => {
    if (!file || !canScan) {
      if (!canScan) setShowPremium(true);
      return;
    }

    setLoading(true);
    setError('');
    const msgInterval = setInterval(() => setLoadingMsg((m) => (m + 1) % loadingMessages.length), 2000);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      const scan: ScanResult = {
        id: generateId(),
        timestamp: Date.now(),
        imageDataUrl: preview,
        portionMultiplier: 1,
        ...data,
      };

      addScan(scan, false);
      incrementScan();
      router.push(`/results/${scan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
      clearInterval(msgInterval);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Scan Your Meal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Upload or capture a photo to analyze</p>
        </div>
        <FreemiumBadge />
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-6">
        {(['upload', 'camera'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); clearImage(); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            {t === 'upload' ? <Upload size={14} /> : <Camera size={14} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative rounded-2xl overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Food preview" className="w-full object-cover max-h-80 rounded-2xl" />
            <button
              onClick={clearImage}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X size={14} />
            </button>
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
              Ready to analyze
            </div>
          </motion.div>
        ) : tab === 'upload' ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ScannerUpload onImage={handleImage} />
          </motion.div>
        ) : (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ScannerCamera onCapture={handleImage} />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </motion.div>
      )}

      {preview && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <button
            onClick={analyze}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400
              hover:from-orange-600 hover:to-amber-500 disabled:opacity-60 disabled:cursor-not-allowed
              text-white font-semibold shadow-lg hover:shadow-orange-500/30 transition-all duration-200
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {loadingMessages[loadingMsg]}
              </>
            ) : (
              <>
                <Zap size={16} />
                Analyze with AI
              </>
            )}
          </button>
        </motion.div>
      )}

      <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Tips for best results</p>
        <ul className="text-xs text-slate-400 dark:text-slate-500 space-y-1">
          <li>• Take photo from directly above the plate</li>
          <li>• Ensure good lighting — natural light is best</li>
          <li>• Include the whole dish in the frame</li>
          <li>• Avoid shadows covering the food</li>
        </ul>
      </div>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
    </div>
  );
}
