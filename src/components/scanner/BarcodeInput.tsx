'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Barcode, Camera, X } from 'lucide-react';
import { useScans } from '@/hooks/useScans';
import { generateId } from '@/lib/utils';
import { ScanResult } from '@/lib/types';

// Minimal shape for the experimental BarcodeDetector API (not in TS DOM lib).
interface DetectedBarcode { rawValue: string }
interface BarcodeDetectorLike { detect(source: CanvasImageSource): Promise<DetectedBarcode[]> }
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorLike;

export default function BarcodeInput() {
  const router = useRouter();
  const { addScan } = useScans();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const detectorSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const lookup = useCallback(async (raw: string) => {
    const clean = raw.trim();
    if (!clean || loading) return;
    stopCamera();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lookup failed');

      const scan: ScanResult = {
        id: generateId(),
        timestamp: Date.now(),
        portionMultiplier: 1,
        ...data,
      };
      addScan(scan, false);
      router.push(`/results/${scan.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setLoading(false);
    }
  }, [loading, addScan, router, stopCamera]);

  const startCamera = useCallback(async () => {
    if (!detectorSupported) return;
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const Ctor = (window as unknown as { BarcodeDetector: BarcodeDetectorCtor }).BarcodeDetector;
      const detector = new Ctor({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });

      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const results = await detector.detect(videoRef.current);
          if (results.length > 0) { lookup(results[0].rawValue); return; }
        } catch { /* transient decode error — keep scanning */ }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError('Could not access camera. Enter the barcode number instead.');
      setScanning(false);
    }
  }, [detectorSupported, lookup]);

  return (
    <div className="space-y-3">
      {/* Camera scanner */}
      {scanning ? (
        <div className="relative rounded-xl overflow-hidden" style={{ background: '#000' }}>
          <video ref={videoRef} className="w-full aspect-square object-cover" muted playsInline />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-24 rounded-lg border-2" style={{ borderColor: 'rgba(255,255,255,0.8)' }} />
          </div>
          <button onClick={stopCamera}
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}>
            <X size={16} />
          </button>
          <p className="absolute bottom-2 inset-x-0 text-center text-xs text-white/80">
            Point at a barcode
          </p>
        </div>
      ) : detectorSupported && (
        <button onClick={startCamera}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-colors"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-1)' }}>
          <Camera size={15} style={{ color: 'var(--accent)' }} /> Scan barcode with camera
        </button>
      )}

      {/* Manual entry */}
      <form onSubmit={(e) => { e.preventDefault(); lookup(code); }} className="space-y-2">
        <div className="relative">
          <Barcode size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ''))}
            inputMode="numeric"
            placeholder="Enter barcode number"
            className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
          />
        </div>
        <button type="submit" disabled={loading || !code}
          className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
          style={{ background: 'var(--accent)' }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Look up product'}
        </button>
      </form>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {!detectorSupported && (
        <p className="text-[11px] text-center" style={{ color: 'var(--text-3)' }}>
          Camera scanning isn&apos;t supported on this browser — type the number under the barcode.
        </p>
      )}
    </div>
  );
}
