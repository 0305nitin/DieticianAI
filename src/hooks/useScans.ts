'use client';
import { useState, useEffect, useCallback } from 'react';
import { ScanResult } from '@/lib/types';
import { getAllScans, getScanById, saveScan, addScanToDaily, updateScan } from '@/lib/storage';

export function useScans() {
  const [scans, setScans] = useState<ScanResult[]>([]);

  useEffect(() => {
    setScans(getAllScans());
  }, []);

  const addScan = useCallback((scan: ScanResult, addToLog = true) => {
    saveScan(scan);
    if (addToLog) addScanToDaily(scan.id);
    setScans(getAllScans());
  }, []);

  const refreshScans = useCallback(() => {
    setScans(getAllScans());
  }, []);

  const patchScan = useCallback((id: string, updates: Partial<ScanResult>) => {
    updateScan(id, updates);
    setScans(getAllScans());
  }, []);

  return { scans, addScan, refreshScans, patchScan, getScanById };
}
