'use client';
import { useEffect, useState } from 'react';

export default function HawkerUncle({ comment }: { comment: string }) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown(''); setDone(false);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setShown(comment.slice(0, i));
      if (i >= comment.length) { clearInterval(t); setDone(true); }
    }, 16);
    return () => clearInterval(t);
  }, [comment]);

  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: 'var(--surface-2)' }}>
        🧑‍🍳
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>AI Commentary</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
          {shown}
          {!done && <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5 align-middle opacity-60" />}
        </p>
      </div>
    </div>
  );
}
