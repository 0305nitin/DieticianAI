'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import {
  UserProfile, ActivityLevel, GoalType,
  ACTIVITY_OPTIONS, GOAL_OPTIONS,
  calculateBMR, calculateTDEE, calculateCalorieGoal, getMacroTargets,
} from '@/lib/bmr';
import { getProfile, saveProfile } from '@/lib/storage';

const DEFAULT: UserProfile = {
  age: 25, gender: 'male', heightCm: 170, weightKg: 70,
  activityLevel: 'moderate', goal: 'maintain',
};

function NumInput({ label, value, onChange, min, max, unit }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; unit: string;
}) {
  return (
    <div className="flex-1">
      <p className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>{label}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg text-lg font-bold flex items-center justify-center transition-colors"
          style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}>−</button>
        <div className="flex-1 h-8 rounded-lg flex items-center justify-center gap-1 font-semibold text-sm"
          style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}>
          {value}<span className="text-xs font-normal" style={{ color: 'var(--text-3)' }}>{unit}</span>
        </div>
        <button onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-lg text-lg font-bold flex items-center justify-center transition-colors"
          style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}>+</button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<UserProfile>(DEFAULT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = getProfile();
    if (p) setForm(p);
  }, []);

  const set = <K extends keyof UserProfile>(key: K, val: UserProfile[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const bmr  = calculateBMR(form);
  const tdee = calculateTDEE(form);
  const goal = calculateCalorieGoal(form);
  const macros = getMacroTargets(goal, form.goal);

  const handleSave = () => {
    saveProfile(form);
    setSaved(true);
    setTimeout(() => router.push('/dashboard'), 800);
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-10 space-y-6">

      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-1)' }}>
          Your Profile
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          Set your stats to get a personalised daily calorie and macro target.
        </p>
      </div>

      <section className="p-5 rounded-xl border space-y-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--text-3)' }}>PERSONAL DETAILS</p>
        <div>
          <p className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>Gender</p>
          <div className="grid grid-cols-2 gap-2">
            {(['male', 'female'] as const).map(g => (
              <button key={g} onClick={() => set('gender', g)}
                className="py-2 rounded-lg text-sm font-medium capitalize transition-all"
                style={{
                  background: form.gender === g ? 'rgba(255,107,53,0.12)' : 'var(--surface-2)',
                  border: `1.5px solid ${form.gender === g ? 'var(--accent)' : 'transparent'}`,
                  color: form.gender === g ? 'var(--accent)' : 'var(--text-1)',
                }}>
                {g === 'male' ? '♂ Male' : '♀ Female'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <NumInput label="Age" value={form.age} onChange={v => set('age', v)} min={10} max={100} unit="yr" />
          <NumInput label="Height" value={form.heightCm} onChange={v => set('heightCm', v)} min={100} max={250} unit="cm" />
          <NumInput label="Weight" value={form.weightKg} onChange={v => set('weightKg', v)} min={30} max={300} unit="kg" />
        </div>
      </section>

      <section className="p-5 rounded-xl border space-y-3"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--text-3)' }}>ACTIVITY LEVEL</p>
        <div className="space-y-2">
          {ACTIVITY_OPTIONS.map(opt => {
            const active = form.activityLevel === opt.id;
            return (
              <button key={opt.id} onClick={() => set('activityLevel', opt.id as ActivityLevel)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                style={{
                  background: active ? 'rgba(255,107,53,0.10)' : 'var(--surface-2)',
                  border: `1.5px solid ${active ? 'var(--accent)' : 'transparent'}`,
                }}>
                <span className="text-xl">{opt.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: active ? 'var(--accent)' : 'var(--text-1)' }}>{opt.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{opt.desc}</p>
                </div>
                {active && <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="p-5 rounded-xl border space-y-3"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--text-3)' }}>YOUR GOAL</p>
        <div className="grid grid-cols-3 gap-2">
          {GOAL_OPTIONS.map(opt => {
            const active = form.goal === opt.id;
            return (
              <button key={opt.id} onClick={() => set('goal', opt.id as GoalType)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-center transition-all"
                style={{
                  background: active ? 'rgba(255,107,53,0.10)' : 'var(--surface-2)',
                  border: `1.5px solid ${active ? 'var(--accent)' : 'transparent'}`,
                }}>
                <span className="text-2xl">{opt.emoji}</span>
                <p className="text-xs font-semibold leading-tight" style={{ color: active ? 'var(--accent)' : 'var(--text-1)' }}>{opt.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      <motion.section
        key={`${bmr}-${tdee}-${goal}`}
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold mb-4" style={{ color: 'var(--text-3)' }}>YOUR DAILY TARGETS</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'BMR', value: bmr, unit: 'kcal', note: 'at rest' },
            { label: 'TDEE', value: tdee, unit: 'kcal', note: 'with activity' },
            { label: 'Goal', value: goal, unit: 'kcal', note: 'daily target', accent: true },
          ].map(item => (
            <div key={item.label} className="rounded-lg p-3 text-center"
              style={{ background: item.accent ? 'rgba(255,107,53,0.12)' : 'var(--surface-2)' }}>
              <p className="text-lg font-bold leading-none mb-0.5"
                style={{ color: item.accent ? 'var(--accent)' : 'var(--text-1)' }}>
                {item.value.toLocaleString()}
              </p>
              <p className="text-[9px] font-medium" style={{ color: 'var(--text-3)' }}>{item.unit}</p>
              <p className="text-[9px]" style={{ color: 'var(--text-3)' }}>{item.label} · {item.note}</p>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-3)' }}>MACRO TARGETS</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Protein', value: macros.protein, color: '#3b82f6' },
            { label: 'Carbs',   value: macros.carbs,   color: '#f59e0b' },
            { label: 'Fat',     value: macros.fat,      color: '#f43f5e' },
          ].map(m => (
            <div key={m.label} className="rounded-lg p-2.5 text-center" style={{ background: 'var(--surface-2)' }}>
              <p className="text-sm font-bold" style={{ color: m.color }}>{m.value}g</p>
              <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{m.label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        <motion.button
          key={saved ? 'saved' : 'save'}
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          onClick={handleSave}
          className="w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          style={saved ? { background: '#1db954', color: '#fff' } : { background: 'var(--accent)', color: '#fff' }}>
          {saved
            ? <><Check size={15} /> Saved — going to dashboard</>
            : <>Save Profile <ChevronRight size={15} /></>
          }
        </motion.button>
      </AnimatePresence>

    </div>
  );
}
