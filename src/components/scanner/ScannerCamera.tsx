'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onCapture: (file: File, preview: string) => void;
}

export default function ScannerCamera({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setActive(true);
      setError('');
    } catch {
      setError('Camera access denied. Please allow camera permissions and try again.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      const preview = canvas.toDataURL('image/jpeg');
      stopCamera();
      onCapture(file, preview);
    }, 'image/jpeg', 0.92);
  };

  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-64 rounded-2xl
        bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-10">
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 text-center max-w-xs">{error}</p>
        )}
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
          <Camera size={24} />
        </div>
        <div className="text-center">
          <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">Use your camera</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Point at your meal for best results</p>
        </div>
        <button
          onClick={startCamera}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white text-sm font-semibold shadow-lg hover:shadow-orange-500/20 transition-all"
        >
          Open Camera
        </button>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black">
      <video ref={videoRef} playsInline muted className="w-full aspect-[4/3] object-cover" />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-6 rounded-2xl border-2 border-white/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/40" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/40" />
        </div>
      </div>

      <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4">
        <button
          onClick={stopCamera}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <X size={16} />
        </button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={capture}
          className="w-16 h-16 rounded-full bg-white border-4 border-white/30 shadow-xl flex items-center justify-center hover:bg-orange-50 transition-colors"
        >
          <Camera size={22} className="text-slate-800" />
        </motion.button>
        <button
          onClick={() => { stopCamera(); setFacingMode((f) => f === 'environment' ? 'user' : 'environment'); setTimeout(startCamera, 100); }}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
}
