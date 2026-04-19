'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function JoinPage() {
  const { code } = useParams();
  const router = useRouter();
  const [state, setState] = useState('loading'); // loading | found | error | joining | done
  const [circle, setCircle] = useState(null);

  useEffect(() => {
    if (!code) return;
    // Look up circle by invite code
    fetch(`/api/circle/join?code=${code.toUpperCase()}`)
      .then(r => r.json())
      .then(d => {
        if (d.circle) {
          setCircle(d.circle);
          setState('found');
        } else {
          setState('error');
        }
      })
      .catch(() => setState('error'));
  }, [code]);

  const handleJoin = async () => {
    setState('joining');
    try {
      const res = await fetch('/api/circle/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data = await res.json();
      if (data.success) {
        setState('done');
        setTimeout(() => router.push('/home'), 1500);
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center px-6">
      {state === 'loading' && (
        <div className="w-8 h-8 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
      )}

      {state === 'found' && circle && (
        <div className="text-center animate-slide-up max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-primary-400 flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
              <circle cx="12" cy="20" r="6" fill="white" opacity="0.95" />
              <circle cx="28" cy="12" r="6" fill="white" opacity="0.75" />
              <circle cx="28" cy="28" r="6" fill="white" opacity="0.75" />
              <line x1="17.5" y1="17" x2="22.5" y2="14" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="17.5" y1="23" x2="22.5" y2="26" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm text-ink-500 mb-1">You've been invited to join</p>
          <h1 className="text-2xl font-display font-semibold text-ink-900 mb-1">{circle.name}</h1>
          <p className="text-sm text-ink-400 mb-8">{circle.member_count} members · {circle.streak} day streak</p>
          <button onClick={handleJoin} className="btn-primary w-full text-base py-4">
            Join circle
          </button>
          <button onClick={() => router.push('/home')} className="mt-3 text-sm text-ink-400 w-full py-2">
            Not now
          </button>
        </div>
      )}

      {state === 'joining' && (
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 rounded-full border-2 border-primary-400 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-ink-500">Joining circle…</p>
        </div>
      )}

      {state === 'done' && (
        <div className="text-center animate-fade-in">
          <p className="text-5xl mb-4">✦</p>
          <h2 className="text-xl font-display font-semibold text-primary-600">Welcome to the circle!</h2>
          <p className="text-sm text-ink-500 mt-2">Taking you home…</p>
        </div>
      )}

      {state === 'error' && (
        <div className="text-center animate-fade-in">
          <p className="text-4xl mb-4">🌙</p>
          <h2 className="text-lg font-medium text-ink-800 mb-2">Invite not found</h2>
          <p className="text-sm text-ink-500 mb-6">The code may be expired or the circle is full (max 7 members).</p>
          <button onClick={() => router.push('/home')} className="btn-primary">Go home</button>
        </div>
      )}
    </div>
  );
}
