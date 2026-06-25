'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  comment: string;
}

export default function HawkerUncle({ comment }: Props) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(comment.slice(0, i));
      if (i >= comment.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, 18);
    return () => clearInterval(timer);
  }, [comment]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex items-start gap-3"
    >
      <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-2xl shadow-lg">
        👨‍🍳
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-xs font-bold text-orange-500 dark:text-orange-400">Hawker Uncle</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-xs text-slate-400 dark:text-slate-500">AI Personality</span>
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800 p-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          {displayed}
          {!done && <span className="inline-block w-0.5 h-4 bg-orange-400 animate-pulse ml-0.5 align-middle" />}
        </div>
      </div>
    </motion.div>
  );
}
