'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, ChevronRight, Zap, Eye, TrendingUp, Sparkles } from 'lucide-react';
import { useScans } from '@/hooks/useScans';
import { scaledNutrition, GRADE_COLORS } from '@/lib/nutrition';

type DisplayScan = {
  id?: string;
  name: string;
  grade: string;
  cal: number;
  time: string;
  emoji?: string;
  image?: string;
};

const SAMPLE_SCANS: DisplayScan[] = [
  { name: 'Hainanese Chicken Rice', grade: 'B', cal: 520, time: '12:34 PM', emoji: '🍚' },
  { name: 'Char Kway Teow', grade: 'D', cal: 780, time: '7:21 PM', emoji: '🍜' },
  { name: 'Laksa', grade: 'C', cal: 645, time: 'Yesterday', emoji: '🥣' },
  { name: 'Nasi Lemak', grade: 'C', cal: 690, time: 'Yesterday', emoji: '🍛' },
  { name: 'Bak Chor Mee', grade: 'B', cal: 490, time: 'Mon', emoji: '🍝' },
  { name: 'Wonton Soup', grade: 'A', cal: 310, time: 'Mon', emoji: '🍲' },
];

function relativeTime(ts: number): string {
  const now = new Date();
  const d = new Date(ts);
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (sameDay) return d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-SG', { weekday: 'short' });
}

const features = [
  { icon: Eye, title: 'Hidden ingredient X-ray', desc: 'Finds coconut milk fat, sambal sugar, and lard that western apps miss entirely.' },
  { icon: Sparkles, title: 'AI portion estimation', desc: 'Computer vision estimates serving sizes. Slide to adjust if you ate more or less.' },
  { icon: TrendingUp, title: 'Macro trends', desc: 'Daily rings and a 7-day chart show your nutrition patterns at a glance.' },
];

export default function Home() {
  const { scans } = useScans();
  const realScans: DisplayScan[] = scans.slice(0, 6).map((s) => ({
    id: s.id,
    name: s.dishName,
    grade: s.nutriGrade,
    cal: scaledNutrition(s.totalNutrition, s.portionMultiplier).calories,
    time: relativeTime(s.timestamp),
    image: s.imageDataUrl,
  }));
  const displayScans = realScans.length > 0 ? realScans : SAMPLE_SCANS;

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-5 pt-20 pb-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-8 border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            Powered by Gemini 2.5 Flash
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter leading-[1.02] mb-6"
            style={{ color: 'var(--text-1)' }}>
            Know exactly<br />
            what you&apos;re<br />
            <span className="gradient-text">eating.</span>
          </h1>

          <p className="text-lg max-w-lg leading-relaxed mb-10" style={{ color: 'var(--text-2)' }}>
            Snap a photo of any Asian meal. AI identifies every ingredient —
            including the hidden ones — and breaks down your calories and macros instantly.
          </p>

          <div className="flex items-center gap-3">
            <Link href="/scan"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'var(--accent)' }}>
              <Camera size={15} />
              Scan a meal
              <ChevronRight size={14} />
            </Link>
            <Link href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border"
              style={{ color: 'var(--text-2)', borderColor: 'var(--border)', background: 'var(--surface)' }}>
              View dashboard
            </Link>
          </div>

          <p className="mt-4 text-xs" style={{ color: 'var(--text-3)' }}>
            3 free scans per day · No sign-up required
          </p>
        </motion.div>
      </section>

      {/* ── Recent Scans ── */}
      <section className="max-w-5xl mx-auto px-5 pb-24">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
            Recent scans
          </h2>
          <Link href="/dashboard" className="text-sm font-medium hover:underline" style={{ color: 'var(--text-2)' }}>
            See all
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {displayScans.map((scan, i) => {
            const card = (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group h-full p-4 rounded-xl cursor-pointer transition-colors"
                style={{ background: 'var(--surface)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
              >
                {scan.image ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden mb-3" style={{ background: 'var(--surface-2)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={scan.image} alt={scan.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="text-3xl mb-3">{scan.emoji}</div>
                )}
                <p className="text-sm font-semibold truncate mb-0.5" style={{ color: 'var(--text-1)' }}>
                  {scan.name}
                </p>
                <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>{scan.time}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>
                    {scan.cal} kcal
                  </span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-sm text-white"
                    style={{ background: GRADE_COLORS[scan.grade as keyof typeof GRADE_COLORS] }}>
                    {scan.grade}
                  </span>
                </div>
              </motion.div>
            );
            return scan.id
              ? <Link key={scan.id} href={`/results/${scan.id}`}>{card}</Link>
              : <div key={`${scan.name}-${i}`}>{card}</div>;
          })}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-5 py-24">
          <h2 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-1)' }}>
            Built for Asian food
          </h2>
          <p className="mb-12 text-sm" style={{ color: 'var(--text-2)' }}>
            Western calorie apps guess. We analyse.
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'var(--surface-2)' }}>
                  <f.icon size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-1)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-5xl mx-auto px-5 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-1)' }}>
              Unlimited scans with Premium
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              $4.99 / month · $39.99 / year · Cancel any time
            </p>
          </div>
          <Link href="/scan"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white whitespace-nowrap transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}>
            <Zap size={14} />
            Upgrade to Premium
          </Link>
        </div>
      </section>

    </div>
  );
}
