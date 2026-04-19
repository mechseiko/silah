'use client';
import { useState } from 'react';
import { CheckIcon, Loader2Icon } from 'lucide-react';

export default function CheckInButton({ circleId, verseKey, onSuccess, alreadyCheckedIn }) {
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);

  const handleCheckIn = async () => {
    if (state === 'done' || alreadyCheckedIn) return;
    setState('loading');

    try {
      const res = await fetch('/api/user/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circleId,
          verseKey,
          reflection: reflection.trim() || null,
        }),
      });

      if (!res.ok) throw new Error('Check-in failed');

      setState('done');
      onSuccess?.();
    } catch (err) {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const isDone = state === 'done' || alreadyCheckedIn;

  return (
    <div className="space-y-3">
      {/* Reflection prompt */}
      {!isDone && (
        <div>
          {!showReflection ? (
            <button
              onClick={() => setShowReflection(true)}
              className="text-sm text-ink-400 hover:text-primary-600 transition-colors"
            >
              + Add a reflection (optional)
            </button>
          ) : (
            <div className="animate-slide-up">
              <textarea
                className="textarea text-sm"
                rows={3}
                placeholder="What's on your heart after reading this verse?"
                value={reflection}
                onChange={e => setReflection(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-ink-400 mt-1 text-right">{reflection.length}/500</p>
            </div>
          )}
        </div>
      )}

      {/* Main check-in button */}
      <button
        onClick={handleCheckIn}
        disabled={state === 'loading' || isDone}
        className={`btn-check-in flex items-center justify-center gap-3 transition-all duration-300
          ${isDone
            ? 'bg-primary-600 cursor-default'
            : state === 'error'
              ? 'bg-alert'
              : 'bg-primary-400 hover:bg-primary-600'
          }`}
      >
        {state === 'loading' ? (
          <Loader2Icon size={20} className="animate-spin" />
        ) : isDone ? (
          <>
            <CheckIcon size={22} strokeWidth={2.5} />
            <span>Read today</span>
          </>
        ) : state === 'error' ? (
          <span>Try again</span>
        ) : (
          <span>I read today</span>
        )}
      </button>

      {isDone && (
        <p className="text-center text-sm text-primary-600 animate-fade-in">
          ✦ Your circle has been notified
        </p>
      )}
    </div>
  );
}
