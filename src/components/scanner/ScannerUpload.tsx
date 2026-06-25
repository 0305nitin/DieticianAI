'use client';
import { useCallback, useRef, useState } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onImage: (file: File, preview: string) => void;
}

export default function ScannerUpload({ onImage }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => onImage(file, e.target?.result as string);
      reader.readAsDataURL(file);
    },
    [onImage]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200
        flex flex-col items-center justify-center gap-4 p-10 min-h-64
        ${dragging
          ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10'
          : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500/50 bg-slate-50 dark:bg-slate-800/40'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <motion.div
        animate={{ scale: dragging ? 1.1 : 1 }}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center
          ${dragging ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}
      >
        {dragging ? <Upload size={24} /> : <ImageIcon size={24} />}
      </motion.div>
      <div className="text-center">
        <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">
          {dragging ? 'Drop your photo here' : 'Drop a photo or click to browse'}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">JPEG, PNG, WEBP up to 20MB</p>
      </div>
    </div>
  );
}
