'use client';
import { useState, useEffect } from 'react';

export function useQuranData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('daily_verse');
    const cacheDate = sessionStorage.getItem('daily_verse_date');
    const today = new Date().toISOString().split('T')[0];

    if (cached && cacheDate === today) {
      setData(JSON.parse(cached));
      setLoading(false);
      return;
    }

    fetch('/api/quran/daily-verse')
      .then(r => r.json())
      .then(d => {
        setData(d);
        sessionStorage.setItem('daily_verse', JSON.stringify(d));
        sessionStorage.setItem('daily_verse_date', today);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useStreak() {
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });

  useEffect(() => {
    fetch('/api/user/streak')
      .then(r => r.json())
      .then(setStreak)
      .catch(() => {});
  }, []);

  return streak;
}

export function useCircle(circleId) {
  const [data, setData] = useState({ feed: [], loading: true });

  useEffect(() => {
    if (!circleId) return;
    fetch(`/api/circle/${circleId}/feed`)
      .then(r => r.json())
      .then(d => setData({ feed: d.feed || [], loading: false }))
      .catch(() => setData(d => ({ ...d, loading: false })));
  }, [circleId]);

  return data;
}
