'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, Flame } from 'lucide-react';
import { RECIPES, Recipe } from '@/lib/recipes';
import { NutriGrade } from '@/lib/types';
import NutriGradeBadge from '@/components/analysis/NutriGrade';

type DiffFilter = 'all' | 'easy' | 'medium' | 'hard';
type TimeFilter = 'all' | '15' | '30';
type GradeFilter = 'all' | NutriGrade;

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false);
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <button onClick={() => setOpen(o => !o)} className="w-full text-left p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: 'var(--surface-2)' }}>
            {recipe.imageEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--text-1)' }}>
                {recipe.name}
              </p>
              <NutriGradeBadge grade={recipe.grade} />
            </div>
            <p className="text-[10px] mt-0.5 mb-2" style={{ color: 'var(--text-3)' }}>
              {recipe.cuisine} · {recipe.difficulty}
            </p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-2)' }}>
                <Clock size={11} /> {totalTime} min
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-2)' }}>
                <Flame size={11} /> {recipe.calories} kcal
              </span>
              <div className="flex gap-1 flex-wrap">
                {recipe.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <ChevronDown size={14} className={`transition-transform shrink-0 mt-1 ${open ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-3)' }} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t px-4 pb-4 pt-3 space-y-4" style={{ borderColor: 'var(--border)' }}>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Protein', value: recipe.protein, color: '#3b82f6', unit: 'g' },
                  { label: 'Carbs',   value: recipe.carbs,   color: '#f59e0b', unit: 'g' },
                  { label: 'Fat',     value: recipe.fat,     color: '#f43f5e', unit: 'g' },
                  { label: 'Fiber',   value: recipe.fiber,   color: '#1db954', unit: 'g' },
                ].map(m => (
                  <div key={m.label} className="rounded-lg p-2 text-center" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-xs font-bold" style={{ color: m.color }}>{m.value}{m.unit}</p>
                    <p className="text-[9px]" style={{ color: 'var(--text-3)' }}>{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Timing */}
              <div className="flex gap-4 text-xs" style={{ color: 'var(--text-3)' }}>
                <span>Prep: <strong style={{ color: 'var(--text-2)' }}>{recipe.prepTime} min</strong></span>
                <span>Cook: <strong style={{ color: 'var(--text-2)' }}>{recipe.cookTime} min</strong></span>
                <span>Serves: <strong style={{ color: 'var(--text-2)' }}>{recipe.servings}</strong></span>
              </div>

              {/* Ingredients */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-3)' }}>INGREDIENTS</p>
                <ul className="space-y-1">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
                      <span style={{ color: 'var(--accent)', flexShrink: 0 }}>·</span> {ing}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-3)' }}>METHOD</p>
                <ol className="space-y-2">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs" style={{ color: 'var(--text-2)' }}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 text-white"
                        style={{ background: 'var(--accent)' }}>{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tip */}
              {recipe.tip && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255,107,53,0.08)', borderLeft: '3px solid var(--accent)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>Pro tip: </span>
                    {recipe.tip}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RecipesPage() {
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
  const [timeFilter, setTimeFilter]   = useState<TimeFilter>('all');
  const [diffFilter, setDiffFilter]   = useState<DiffFilter>('all');

  const filtered = useMemo(() => {
    return RECIPES.filter(r => {
      if (gradeFilter !== 'all' && r.grade !== gradeFilter) return false;
      const total = r.prepTime + r.cookTime;
      if (timeFilter === '15' && total > 15) return false;
      if (timeFilter === '30' && total > 30) return false;
      if (diffFilter !== 'all' && r.difficulty !== diffFilter) return false;
      return true;
    });
  }, [gradeFilter, timeFilter, diffFilter]);

  return (
    <div className="max-w-lg mx-auto px-5 py-10 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-1)' }}>
          Healthy Recipes
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          {RECIPES.length} quick, nutritious Asian meals
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {/* Grade filter */}
        <div>
          <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-3)' }}>GRADE</p>
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'A', 'B', 'C'] as GradeFilter[]).map(g => {
              const gradeColors: Record<string, string> = { A: '#1db954', B: '#3b82f6', C: '#f59e0b' };
              const active = gradeFilter === g;
              return (
                <button key={g} onClick={() => setGradeFilter(g)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: active ? (g === 'all' ? 'var(--accent)' : gradeColors[g]) : 'var(--surface-2)',
                    color: active ? '#fff' : 'var(--text-2)',
                  }}>
                  {g === 'all' ? 'All grades' : `Grade ${g}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time filter */}
        <div>
          <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-3)' }}>TIME</p>
          <div className="flex gap-1.5">
            {[['all', 'Any time'], ['15', '≤ 15 min'], ['30', '≤ 30 min']] .map(([v, label]) => (
              <button key={v} onClick={() => setTimeFilter(v as TimeFilter)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: timeFilter === v ? 'var(--accent)' : 'var(--surface-2)',
                  color: timeFilter === v ? '#fff' : 'var(--text-2)',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty filter */}
        <div>
          <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-3)' }}>DIFFICULTY</p>
          <div className="flex gap-1.5">
            {(['all', 'easy', 'medium', 'hard'] as DiffFilter[]).map(d => (
              <button key={d} onClick={() => setDiffFilter(d)}
                className="px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all"
                style={{
                  background: diffFilter === d ? 'var(--accent)' : 'var(--surface-2)',
                  color: diffFilter === d ? '#fff' : 'var(--text-2)',
                }}>
                {d === 'all' ? 'Any' : d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs" style={{ color: 'var(--text-3)' }}>
        Showing {filtered.length} recipe{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Recipe list */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <p className="text-2xl mb-3">🍽️</p>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>No recipes match your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </div>
  );
}
