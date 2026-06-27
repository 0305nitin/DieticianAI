'use client';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--surface-2)]"
      style={{ color: 'var(--text-2)' }}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
