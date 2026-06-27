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
      className="relative cursor-pointer rounded-xl flex flex-col items-center justify-center gap-4 p-10 min-h-64 transition-all duration-200"
      style={{
        background: dragging ? 'rgba(255,107,53,0.06)' : 'var(--surface)',
        border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <motion.div
        animate={{ scale: dragging ? 1.08 : 1 }}
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: dragging ? 'var(--accent)' : 'var(--surface-2)' }}
      >
        {dragging
          ? <Upload size={20} color="#fff" />
          : <ImageIcon size={20} style={{ color: 'var(--text-3)' }} />
        }
      </motion.div>
      <div className="text-center">
        <p className="font-medium text-sm" style={{ color: 'var(--text-1)' }}>
          {dragging ? 'Drop your photo here' : 'Drop a photo or click to browse'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>JPEG, PNG, WEBP up to 20MB</p>
      </div>
    </div>
  );
}
