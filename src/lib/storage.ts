import { ScanResult, DailyLog, ModelChoice } from './types';

const SCANS_KEY = 'hawkersense_scans';
const DAILY_LOG_KEY = 'hawkersense_daily_log';
const PREMIUM_KEY = 'hawkersense_premium';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getAllScans(): ScanResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SCANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getScanById(id: string): ScanResult | null {
  return getAllScans().find((s) => s.id === id) ?? null;
}

export function saveScan(scan: ScanResult): void {
  const scans = getAllScans();
  scans.unshift(scan);
  localStorage.setItem(SCANS_KEY, JSON.stringify(scans.slice(0, 200)));
}

export function updateScan(id: string, updates: Partial<ScanResult>): void {
  const scans = getAllScans();
  const idx = scans.findIndex((s) => s.id === id);
  if (idx !== -1) {
    scans[idx] = { ...scans[idx], ...updates };
    localStorage.setItem(SCANS_KEY, JSON.stringify(scans));
  }
}

export function getDailyLog(date?: string): DailyLog {
  if (typeof window === 'undefined') return { date: getTodayString(), scanIds: [] };
  const d = date ?? getTodayString();
  try {
    const raw = localStorage.getItem(`${DAILY_LOG_KEY}_${d}`);
    return raw ? JSON.parse(raw) : { date: d, scanIds: [] };
  } catch {
    return { date: d, scanIds: [] };
  }
}

export function addScanToDaily(scanId: string): void {
  const today = getTodayString();
  const log = getDailyLog(today);
  if (!log.scanIds.includes(scanId)) {
    log.scanIds.push(scanId);
    localStorage.setItem(`${DAILY_LOG_KEY}_${today}`, JSON.stringify(log));
  }
}

export function getWeeklyLogs(): DailyLog[] {
  const logs: DailyLog[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    logs.push(getDailyLog(dateStr));
  }
  return logs;
}

export function isPremium(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PREMIUM_KEY) === 'true';
}

export function setPremium(value: boolean): void {
  localStorage.setItem(PREMIUM_KEY, String(value));
}

// -- Model credits --

const MODEL_CREDITS_KEY = 'dieticianai_model_credits';

interface ModelCreditStore {
  date: string;
  usage: Partial<Record<ModelChoice, number>>;
}

function getModelCreditStore(): ModelCreditStore {
  if (typeof window === 'undefined') return { date: getTodayString(), usage: {} };
  try {
    const raw = localStorage.getItem(MODEL_CREDITS_KEY);
    const store: ModelCreditStore = raw ? JSON.parse(raw) : { date: getTodayString(), usage: {} };
    if (store.date !== getTodayString()) return { date: getTodayString(), usage: {} };
    return store;
  } catch {
    return { date: getTodayString(), usage: {} };
  }
}

export function getModelUsage(model: ModelChoice): number {
  return getModelCreditStore().usage[model] ?? 0;
}

export function incrementModelUsage(model: ModelChoice): void {
  const store = getModelCreditStore();
  store.usage[model] = (store.usage[model] ?? 0) + 1;
  localStorage.setItem(MODEL_CREDITS_KEY, JSON.stringify(store));
}

// -- Portion history --

const PORTION_HISTORY_KEY = 'dieticianai_portion_history';

type PortionHistory = Record<string, number[]>;

const DISH_KEYWORDS: Record<string, string> = {
  noodle: 'noodles', mee: 'noodles', pasta: 'noodles', kway: 'noodles',
  spaghetti: 'noodles', ramen: 'noodles', udon: 'noodles', pho: 'noodles',
  rice: 'rice', nasi: 'rice', biryani: 'rice', 'fried rice': 'rice',
  soup: 'soup', laksa: 'soup', bak: 'soup', congee: 'soup', porridge: 'soup',
  chicken: 'protein', fish: 'protein', pork: 'protein', beef: 'protein', tofu: 'protein',
  salad: 'light', bread: 'light', sandwich: 'light',
};

function getDishCategory(dishName: string): string {
  const lower = dishName.toLowerCase();
  for (const [kw, cat] of Object.entries(DISH_KEYWORDS)) {
    if (lower.includes(kw)) return cat;
  }
  return 'other';
}

function getPortionHistory(): PortionHistory {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PORTION_HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getSuggestedMultiplier(dishName: string): number | null {
  const history = getPortionHistory();
  const cat = getDishCategory(dishName);
  const values = history[cat];
  if (!values || values.length < 2) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(avg * 4) / 4;
}

export function recordPortionMultiplier(dishName: string, multiplier: number): void {
  const history = getPortionHistory();
  const cat = getDishCategory(dishName);
  const values = history[cat] ?? [];
  values.push(multiplier);
  history[cat] = values.slice(-10);
  localStorage.setItem(PORTION_HISTORY_KEY, JSON.stringify(history));
}
