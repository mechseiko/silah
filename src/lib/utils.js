import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Avatar initials from name
export function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '?';
}

// Avatar background color deterministically from string
const AVATAR_COLORS = [
  'bg-primary-400 text-white',
  'bg-gold-400 text-ink-900',
  'bg-teal-500 text-white',
  'bg-emerald-500 text-white',
  'bg-sky-500 text-white',
  'bg-violet-500 text-white',
  'bg-rose-500 text-white',
];

export function getAvatarColor(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Format relative time
export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Streak heatmap data for last 90 days
export function buildHeatmapData(checkins, userId) {
  const map = {};
  checkins.forEach(c => {
    if (!userId || c.user_id === userId) {
      map[c.date] = (map[c.date] || 0) + 1;
    }
  });

  const days = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days.push({ date: key, count: map[key] || 0 });
  }
  return days;
}

// Audio URL helper
export function getAudioUrl(audioFile) {
  if (!audioFile) return null;
  if (audioFile.url) return audioFile.url;
  // Fallback CDN pattern
  return `https://verses.quran.com/${audioFile.audio_url}`;
}
