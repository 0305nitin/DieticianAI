'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, ChevronDown } from 'lucide-react';
import MultiPhotoUpload, { PhotoSlot } from '@/components/scanner/MultiPhotoUpload';
import ScannerCamera from '@/components/scanner/ScannerCamera';
import ContainerPicker from '@/components/scanner/ContainerPicker';
import ModelPicker from '@/components/scanner/ModelPicker';
import FreemiumBadge from '@/components/ui/FreemiumBadge';
import PremiumModal from '@/components/ui/PremiumModal';
import { useFreemium } from '@/hooks/useFreemium';
import { useModelCredits } from '@/hooks/useModelCredits';
import { useScans } from '@/hooks/useScans';
import { generateId } from '@/lib/utils';
import { ScanResult, ModelChoice, ContainerType } from '@/lib/types';

type Tab = 'upload' | 'camera';

const loadingSteps = [
  'Identifying food items…',
  'Detecting hidden ingredients…',
  'Calibrating portion sizes…',
  'Calculating nutrition…',
  'Grading your meal…',
];

export default function ScanPage() {
  const router = useRouter();
  const { canScan, incrementScan, isPremium } = useFreemium();
  const { canUseModel, creditsRemaining, usage, increment: incrementModelCredit } = useModelCredits();
  const { addScan } = useScans();

  const [tab, setTab] = useState<Tab>('upload');
  const [photos, setPhotos] = useState<PhotoSlot[]>([]);
  const [model, setModel] = useState<ModelChoice>('gemini-2.5-flash');
  const [container, setContainer] = useState<ContainerType>('unknown');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [showPremium, setShowPremium] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Camera captures go into the photos array
  const handleCameraCapture = useCallback((file: File, preview: string) => {
    setPhotos(prev => prev.length < 3 ? [...prev, { file, preview }] : prev);
    setError('');
  }, []);

  const clearAll = () => { setPhotos([]); setError(''); };

  const analyze = async () => {
    if (photos.length === 0) return;
    if (!canScan) { setShowPremium(true); return; }
    if (!canUseModel(model)) {
      setError(`Daily limit reached for ${model}. Choose another model or try again tomorrow.`);
      return;
    }

    setLoading(true); setError('');
    const iv = setInterval(() => setStep(s => (s + 1) % loadingSteps.length), 1800);

    try {
      const fd = new FormData();
      photos.forEach((p, i) => fd.append(`image_${i}`, p.file));
      fd.append('model', model);
      fd.append('container', container);
      fd.append('isPremium', String(isPremium));
      fd.append('modelUsage', String(usage[model] ?? 0));

      const res = await fetch('/api/analyze', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      const scan: ScanResult = {
        id: generateId(),
        timestamp: Date.now(),
        imageDataUrl: photos[0].preview,
        portionMultiplier: 1,
        modelUsed: model,
        ...data,
      };

      addScan(scan, false);
      incrementScan();
      if (model !== 'gemini-2.5-flash') incrementModelCredit(model);
      router.push(`/results/${scan.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false); clearInterval(iv);
    }
  };

  const hasPhotos = photos.length > 0;

  return (
    <div className="max-w-lg mx-auto px-5 py-10 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-1)' }}>
            Scan your meal
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Upload up to 3 angles for better accuracy
          </p>
        </div>
        <FreemiumBadge />
      </div>

      {/* Premium: Model picker */}
      {isPremium && (
        <ModelPicker value={model} onChange={setModel} creditsRemaining={creditsRemaining} />
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--surface)' }}>
        {(['upload', 'camera'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); clearAll(); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-2)',
            }}>
            {t === 'upload' ? '↑ Upload' : '⊙ Camera'}
          </button>
        ))}
      </div>

      {/* Photo input area */}
      <AnimatePresence mode="wait">
        {tab === 'upload' ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MultiPhotoUpload photos={photos} onChange={setPhotos} maxPhotos={3} />
          </motion.div>
        ) : (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            <ScannerCamera onCapture={handleCameraCapture} />
            {/* Show captured photos from camera below */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden aspect-square"
                    style={{ background: 'var(--surface-2)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.preview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 px-1 py-0.5 rounded text-[9px] font-semibold text-white"
                      style={{ background: 'rgba(0,0,0,0.55)' }}>
                      {i === 0 ? 'Main' : `+${i}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {photos.length > 0 && photos.length < 3 && (
              <p className="text-[10px] text-center" style={{ color: 'var(--text-3)' }}>
                Capture another angle to improve portion accuracy
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced: Container picker (collapsible) */}
      {hasPhotos && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => setShowAdvanced(o => !o)}
            className="flex items-center gap-1.5 text-xs font-medium mb-2 transition-colors"
            style={{ color: 'var(--text-3)' }}>
            <ChevronDown size={13} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            {showAdvanced ? 'Hide' : 'Improve accuracy'} — set container type
          </button>
          <AnimatePresence>
            {showAdvanced && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <ContainerPicker value={container} onChange={setContainer} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg text-sm border"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
          {error}
        </motion.div>
      )}

      {/* Loading overlay over first photo */}
      {loading && photos.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3"
          style={{ background: 'rgba(0,0,0,0.75)' }}>
          <Loader2 size={32} className="animate-spin text-white" />
          <p className="text-sm font-medium text-white">{loadingSteps[step]}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Using {model}</p>
        </div>
      )}

      {/* Actions */}
      {hasPhotos && !loading && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
          <button onClick={clearAll}
            className="w-12 h-12 rounded-lg flex items-center justify-center border shrink-0 transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface)' }}>
            ✕
          </button>
          <button onClick={analyze}
            className="flex-1 h-12 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}>
            <Zap size={15} />
            Analyse with AI
            {photos.length > 1 && <span className="text-xs opacity-75">({photos.length} angles)</span>}
          </button>
        </motion.div>
      )}

      {/* Camera tip if no camera photos yet */}
      {tab === 'camera' && photos.length === 0 && (
        <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-1)' }}>Tips for best results</p>
          <ul className="space-y-1.5">
            {['Shoot from directly above the plate first', 'Add a side angle for portion depth', 'Good lighting — avoid harsh shadows'].map(t => (
              <li key={t} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--accent)' }}>·</span> {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload tips */}
      {tab === 'upload' && photos.length === 0 && (
        <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-1)' }}>Tips for best results</p>
          <ul className="space-y-1.5">
            {['Add a top-down shot as your main photo', 'Add a side shot to help estimate food height', 'Include the whole dish in frame'].map(t => (
              <li key={t} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--accent)' }}>·</span> {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
    </div>
  );
}
