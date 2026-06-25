'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, Brain, TrendingUp, Shield, Zap, ChevronRight, Star } from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Computer Vision Scanning',
    desc: 'Snap any plate — our AI identifies every individual food item, estimates portions visually, and lets you fine-tune the amount.',
    color: 'from-orange-500 to-amber-400',
  },
  {
    icon: Brain,
    title: 'Hidden Ingredient X-Ray',
    desc: 'Detects invisible fats in coconut milk broth, sugar in sambal, lard in char kway teow — the stuff western apps totally miss.',
    color: 'from-violet-500 to-purple-400',
  },
  {
    icon: Shield,
    title: 'Nutri-Grade + Hawker Uncle',
    desc: 'Get a Singapore-style A–E nutritional grade and hilarious Singlish commentary from your virtual Hawker Uncle AI.',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    icon: TrendingUp,
    title: 'Macro Rings & Weekly Trends',
    desc: 'Beautiful daily macro rings, per-meal scan cards, and 7-day calorie charts to keep your diet on track.',
    color: 'from-blue-500 to-cyan-400',
  },
];

const dishes = [
  { name: 'Chicken Rice', grade: 'B', cal: 520 },
  { name: 'Char Kway Teow', grade: 'D', cal: 780 },
  { name: 'Laksa', grade: 'C', cal: 640 },
  { name: 'Bak Chor Mee', grade: 'B', cal: 490 },
];

const gradeColors: Record<string, string> = {
  A: 'bg-emerald-500',
  B: 'bg-green-500',
  C: 'bg-yellow-500',
  D: 'bg-orange-500',
  E: 'bg-red-500',
};

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/08 rounded-full blur-3xl" />
      </div>

      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20
            text-orange-600 dark:text-orange-400 text-xs font-medium mb-6">
            <Star size={11} className="fill-current" />
            Built for Singapore hawker culture
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-5 leading-[1.1]">
            AI that actually<br />
            <span className="gradient-text">understands</span> your food
          </h1>

          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Snap a photo of your hawker meal. HawkerSense identifies every ingredient —
            including the hidden ones — and gives you accurate calories, macros, and a
            nutritional grade. No more guessing.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/scan"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500
                text-white font-semibold text-sm shadow-lg hover:shadow-orange-500/30
                transition-all duration-200 group"
            >
              <Camera size={16} />
              Start Scanning Free
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                border border-slate-200 dark:border-slate-700
                text-slate-700 dark:text-slate-300 font-medium text-sm
                hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              View Dashboard
            </Link>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">3 free scans daily • No credit card required</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-14 w-full max-w-md"
        >
          <div className="rounded-2xl border border-slate-200 dark:border-white/[0.07]
            bg-white dark:bg-slate-900 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">Recent Scans</span>
            </div>
            <div className="p-3 space-y-2">
              {dishes.map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg ${gradeColors[d.grade]} flex items-center justify-center text-white text-xs font-bold`}>
                      {d.grade}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{d.name}</span>
                  </div>
                  <span className="text-sm text-slate-400 dark:text-slate-500">{d.cal} kcal</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Built different — for Asian food
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
            Western nutrition apps fail on laksa, nasi lemak, and char siew. We don&apos;t.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-2xl border border-slate-200 dark:border-white/[0.07]
                bg-white dark:bg-slate-900 hover:border-orange-200 dark:hover:border-orange-500/20
                transition-colors duration-200"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                <f.icon size={18} className="text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5 text-sm">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 p-px shadow-xl shadow-orange-500/20">
          <div className="rounded-[calc(1rem-1px)] bg-white dark:bg-slate-900 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-medium mb-3">
                <Zap size={11} />
                Premium
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Unlimited scanning, zero limits
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Upgrade for $4.99/month or $39.99/year — cancel any time.
              </p>
            </div>
            <Link
              href="/scan"
              className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl
                bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500
                text-white font-semibold text-sm shadow-lg transition-all whitespace-nowrap"
            >
              <Zap size={14} />
              Get Premium
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
