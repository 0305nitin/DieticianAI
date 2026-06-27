'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader2, X, Zap, RotateCcw } from 'lucide-react';
import ScannerUpload from '@/components/scanner/ScannerUpload';
import ScannerCamera from '@/components/scanner/ScannerCamera';
import FreemiumBadge from '@/components/ui/FreemiumBadge';
import PremiumModal from '@/components/ui/PremiumModal';
import { useFreemium } from '@/hooks/useFreemium';
import { useScans } from '@/hooks/useScans';
import { generateId } from '@/lib/utils';
import { ScanResult } from '@/lib/types';

type Tab = 'upload' | 'camera';

const loadingSteps = [
  'Identifying food items…',
  'Detecting hidden ingredients…',
  'Calculating nutrition…',
  'Grading your meal…',
  'Preparing results…',
];

export default function ScanPage() {
  const router = useRouter();
  const { canScan, incrementScan } = useFreemium();
  const { addScan } = useScans();
  const [tab, setTab] = useState<Tab>('upload');
  const [preview, setPreview] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [showPremium, setShowPremium] = useState(false);

  const handleImage = useCallback((f: File, p: string) => {
    setFile(f); setPreview(p); setError('');
  }, []);

  const clearImage = () => { setFile(null); setPreview(''); setError(''); };

  const analyze = async () => {
    if (!file) return;
    if (!canScan) { setShowPremium(true); return; }
    setLoading(true); setError('');
    const iv = setInterval(() => setStep(s => (s + 1) % loadingSteps.length), 1800);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/analyze', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      const scan: ScanResult = { id: generateId(), timestamp: Date.now(), imageDataUrl: preview, portionMultiplier: 1, ...data };
      addScan(scan, false);
      incrementScan();
      router.push(`/results/${scan.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false); clearInterval(iv);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-1)' }}>
            Scan your meal
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Upload a photo or use your camera
          </p>
        </div>
        <FreemiumBadge />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-lg mb-6" style={{ background: 'var(--surface)' }}>
        {(['upload', 'camera'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); clearImage(); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-2)',
            }}>
            {t === 'upload' ? <Upload size={13} /> : <Camera size={13} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Scanner area */}
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div key="preview"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="relative rounded-xl overflow-hidden"
            style={{ background: 'var(--surface)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full object-cover max-h-72" />
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                style={{ background: 'rgba(0,0,0,0.7)' }}>
                <Loader2 size={28} className="animate-spin text-white" />
                <p className="text-sm font-medium text-white">{loadingSteps[step]}</p>
              </div>
            )}
            {!loading && (
              <button onClick={clearImage}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white"
                style={{ background: 'rgba(0,0,0,0.5)' }}>
                <X size={13} />
              </button>
            )}
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

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg text-sm border"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
          {error}
        </motion.div>
      )}

      {/* Actions */}
      {preview && !loading && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex gap-2">
          <button onClick={clearImage}
            className="w-10 h-12 rounded-lg flex items-center justify-center transition-colors border flex-shrink-0"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface)' }}>
            <RotateCcw size={15} />
          </button>
          <button onClick={analyze}
            className="flex-1 h-12 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}>
            <Zap size={15} />
            Analyse with AI
          </button>
        </motion.div>
      )}

      {/* Tips */}
      <div className="mt-8 p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <p className="text-xs font-semibold mb-2.5" style={{ color: 'var(--text-1)' }}>Tips for best results</p>
        <ul className="space-y-1.5">
          {['Shoot from directly above the plate', 'Good lighting — avoid harsh shadows', 'Include the whole dish in frame'].map(t => (
            <li key={t} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--accent)' }}>·</span> {t}
            </li>
          ))}
        </ul>
      </div>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
    </div>
  );
}
