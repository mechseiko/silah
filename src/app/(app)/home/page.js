'use client';
import { useState } from 'react';
import { useQuranData, useStreak } from '@/hooks/useQuranData';
import { useUserCircle } from '@/hooks/useUserCircle';
import VerseCard from '@/components/verse/VerseCard';
import CheckInButton from '@/components/verse/CheckInButton';
import CircleFeed from '@/components/circle/CircleFeed';
import { FlameIcon, UsersIcon } from 'lucide-react';

export default function HomePage() {
  const { data, loading, error } = useQuranData();
  const { currentStreak, longestStreak } = useStreak();
  const { circleId, loading: circleLoading } = useUserCircle();
  const [checkedIn, setCheckedIn] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = async () => {
    setIsBookmarked(b => !b);
    if (!isBookmarked && data?.verseKey) {
      await fetch('/api/user/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verseKey: data.verseKey }),
      });
    }
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold text-ink-900">
              Silah · صلة
            </h1>
            <p className="text-sm text-ink-500 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Streak badge */}
          {currentStreak > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-full px-3 py-1.5">
              <FlameIcon size={14} className="text-amber-500" />
              <span className="text-sm font-medium text-amber-700">{currentStreak}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 space-y-5">
        {/* Daily verse card */}
        {loading ? (
          <div className="verse-card animate-pulse">
            <div className="space-y-4">
              <div className="h-3 bg-primary-100 rounded w-32" />
              <div className="h-8 bg-primary-100 rounded w-full" />
              <div className="h-8 bg-primary-100 rounded w-3/4" />
              <div className="h-4 bg-primary-100 rounded w-full mt-4" />
              <div className="h-4 bg-primary-100 rounded w-2/3" />
            </div>
          </div>
        ) : error ? (
          <div className="verse-card text-center py-8">
            <p className="text-ink-500 text-sm">Could not load today's verse.</p>
            <p className="text-xs text-ink-400 mt-1">Check your connection and try again.</p>
          </div>
        ) : data ? (
          <VerseCard
            verse={data.verse}
            chapter={data.chapter}
            audio={data.audio}
            tafsir={data.tafsir}
            onBookmark={handleBookmark}
            isBookmarked={isBookmarked}
          />
        ) : null}

        {/* Check-in */}
        <CheckInButton
          circleId={circleId}
          verseKey={data?.verseKey}
          onSuccess={() => setCheckedIn(true)}
          alreadyCheckedIn={checkedIn}
          disabled={!circleId || circleLoading}
        />

        {/* Streak summary */}
        {(currentStreak > 0 || longestStreak > 0) && (
          <div className="grid grid-cols-2 gap-3">
            <div className="card-sm text-center">
              <p className="text-2xl font-semibold text-primary-600">{currentStreak}</p>
              <p className="text-xs text-ink-500 mt-0.5">day streak</p>
            </div>
            <div className="card-sm text-center">
              <p className="text-2xl font-semibold text-ink-600">{longestStreak}</p>
              <p className="text-xs text-ink-500 mt-0.5">personal best</p>
            </div>
          </div>
        )}

        {/* Circle feed */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <UsersIcon size={15} className="text-ink-400" />
            <h2 className="text-sm font-medium text-ink-600">Your circle today</h2>
          </div>
          <div className="card">
            <CircleFeed circleId={circleId} />
          </div>
        </div>
      </div>
    </div>
  );
}
