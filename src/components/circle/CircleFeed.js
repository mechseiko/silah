'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Avatar from '@/components/ui/Avatar';
import { timeAgo } from '@/lib/utils';
import { BookOpenIcon, MessageSquareIcon } from 'lucide-react';

function FeedItem({ item }) {
  const name = item.profiles?.display_name || 'Friend';
  const reflection = item.reflections?.[0]?.body;

  return (
    <div className="flex gap-3 py-4 border-b border-ink-50 last:border-0 animate-fade-in">
      <Avatar name={name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-ink-800">{name}</span>
          <span className="text-xs text-ink-400">{timeAgo(item.checked_in_at)}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-primary-600">
          <BookOpenIcon size={12} />
          <span>Read {item.verse_key}</span>
        </div>

        {reflection && (
          <div className="mt-2 p-3 bg-primary-50 rounded-xl">
            <p className="text-sm text-ink-700 leading-relaxed">{reflection}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CircleFeed({ circleId }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!circleId) return;

    // Initial fetch
    fetch(`/api/circle/${circleId}/feed`)
      .then(r => r.json())
      .then(d => {
        setFeed(d.feed || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Realtime subscription for new checkins
    const channel = supabase
      .channel(`circle-${circleId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'checkins',
        filter: `circle_id=eq.${circleId}`,
      }, payload => {
        setFeed(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [circleId]);

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-ink-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-ink-100 rounded w-24" />
              <div className="h-3 bg-ink-100 rounded w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!feed.length) {
    return (
      <div className="py-10 text-center">
        <p className="text-4xl mb-3">🌿</p>
        <p className="text-sm text-ink-500">No check-ins yet today.</p>
        <p className="text-sm text-ink-400">Be the first in your circle!</p>
      </div>
    );
  }

  return (
    <div>
      {feed.map(item => (
        <FeedItem key={item.id} item={item} />
      ))}
    </div>
  );
}
