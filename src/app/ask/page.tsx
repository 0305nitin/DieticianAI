'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUp, Loader2 } from 'lucide-react';
import { useDailyMacros } from '@/hooks/useDailyMacros';
import { useProfile } from '@/hooks/useProfile';
import { useScans } from '@/hooks/useScans';
import { calculateCalorieGoal, getMacroTargets } from '@/lib/bmr';
import { DAILY_TARGETS } from '@/lib/types';
import { scaledNutrition } from '@/lib/nutrition';

interface Msg { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'How am I doing on protein today?',
  'What should I eat for dinner?',
  'Is my week too high in fat?',
  'Suggest a healthy hawker lunch',
];

export default function AskPage() {
  const { macros } = useDailyMacros();
  const { profile } = useProfile();
  const { scans } = useScans();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const targets = profile
    ? getMacroTargets(calculateCalorieGoal(profile), profile.goal)
    : DAILY_TARGETS;

  const buildContext = useCallback(() => {
    const lines: string[] = [];
    if (profile) {
      lines.push(`Goal: ${profile.goal}. Daily targets: ${targets.calories} kcal, ${targets.protein}g protein, ${targets.carbs}g carbs, ${targets.fat}g fat.`);
    } else {
      lines.push('No profile set yet (using default 2000 kcal targets).');
    }
    lines.push(`Today so far: ${macros.calories} kcal, ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fat}g fat. Remaining calories: ${Math.max(0, targets.calories - macros.calories)}.`);
    const recent = scans.slice(0, 8).map((s) => {
      const n = scaledNutrition(s.totalNutrition, s.portionMultiplier);
      return `- ${s.dishName} (grade ${s.nutriGrade}, ${n.calories} kcal)`;
    });
    if (recent.length) lines.push(`Recent scans:\n${recent.join('\n')}`);
    return lines.join('\n');
  }, [profile, macros, scans, targets]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError('');
    const next: Msg[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, context: buildContext() }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Chat request failed');
      }

      setMessages((m) => [...m, { role: 'assistant', content: '' }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: acc };
          return copy;
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setMessages((m) => (m[m.length - 1]?.role === 'assistant' && m[m.length - 1].content === '' ? m.slice(0, -1) : m));
    } finally {
      setBusy(false);
    }
  };

  const empty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] md:h-dvh max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <Sparkles size={20} style={{ color: 'var(--accent)' }} /> Ask AI
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
          Your personal dietician — knows your goals and logged meals.
        </p>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 space-y-4">
        {empty ? (
          <div className="pt-6">
            <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-3)' }}>TRY ASKING</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-left text-sm px-4 py-3 rounded-xl border transition-colors"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={m.role === 'user'
                  ? { background: 'var(--accent)', color: '#fff', borderBottomRightRadius: 6 }
                  : { background: 'var(--surface)', color: 'var(--text-1)', border: '1px solid var(--border)', borderBottomLeftRadius: 6 }}>
                {m.content || <Loader2 size={14} className="animate-spin" />}
              </div>
            </motion.div>
          ))
        )}
        {error && (
          <div className="text-xs px-4 py-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
            {error}
          </div>
        )}
        <div className="h-2" />
      </div>

      {/* Composer */}
      <div className="px-5 py-4">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-end gap-2 p-2 rounded-2xl border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            rows={1}
            placeholder="Ask about your nutrition…"
            className="flex-1 resize-none bg-transparent outline-none text-sm px-2 py-1.5 max-h-32"
            style={{ color: 'var(--text-1)' }}
          />
          <button type="submit" disabled={busy || !input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
          </button>
        </form>
        <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-3)' }}>
          AI can make mistakes — verify important nutrition decisions.
        </p>
      </div>
    </div>
  );
}
