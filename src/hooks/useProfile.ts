'use client';
import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/lib/bmr';
import { getProfile, saveProfile } from '@/lib/storage';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const update = useCallback((p: UserProfile) => {
    saveProfile(p);
    setProfile(p);
  }, []);

  return { profile, update };
}
