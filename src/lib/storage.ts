import { ScanResult, DailyLog } from './types';

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
