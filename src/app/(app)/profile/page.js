'use client';
import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import { FlameIcon, BookOpenIcon, BookmarkIcon, ScrollIcon, SettingsIcon, ChevronRightIcon } from 'lucide-react';

const TABS = ['Stats', 'Journal', 'Bookmarks'];

function StatCard({ label, value, unit }) {
  return (
    <div className="card-sm text-center">
      <p className="text-2xl font-semibold text-primary-600">{value}</p>
      {unit && <p className="text-xs text-ink-400">{unit}</p>}
      <p className="text-xs text-ink-500 mt-0.5">{label}</p>
    </div>
  );
}

function JournalEntry({ entry }) {
  return (
    <div className="py-4 border-b border-ink-50 last:border-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-ink-400">
          {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <span className="pill-green">{entry.verse_key}</span>
      </div>
      <p className="text-sm text-ink-700 leading-relaxed">{entry.body}</p>
    </div>
  );
}

function BookmarkItem({ bookmark }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-ink-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
        <BookmarkIcon size={14} className="text-primary-600" fill="currentColor" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-800">{bookmark.verse_key}</p>
        <p className="text-xs text-ink-500 truncate">{bookmark.preview}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('Stats');
  const [showSettings, setShowSettings] = useState(false);

  // Demo data
  const user = { display_name: 'Ahmad Musa', username: 'ahmad_m' };
  const stats = { streak: 47, longest: 72, ayahs: 312, days: 63, circles: 2 };

  const journal = [
    { id: 1, date: '2026-04-11', verse_key: '94:6', body: 'This verse arrived at exactly the right moment. Work has been hard, but reading this reminded me that ease always follows hardship — not eventually, but together with it.' },
    { id: 2, date: '2026-04-10', verse_key: '2:286', body: 'Allah does not burden a soul beyond what it can bear. I needed to hear this today more than I can explain.' },
    { id: 3, date: '2026-04-09', verse_key: '3:160', body: 'If Allah helps you, none can overcome you. Simple words. Immense weight.' },
  ];

  const bookmarks = [
    { id: 1, verse_key: '2:255', preview: 'Allah — there is no deity except Him...' },
    { id: 2, verse_key: '94:5-6', preview: 'For indeed, with hardship will be ease...' },
    { id: 3, verse_key: '13:28', preview: 'Verily, in the remembrance of Allah do hearts find rest.' },
    { id: 4, verse_key: '65:3', preview: 'And whoever relies upon Allah — then He is sufficient for him.' },
  ];

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={user.display_name} size="xl" />
            <div>
              <h1 className="text-xl font-display font-semibold text-ink-900">{user.display_name}</h1>
              <p className="text-sm text-ink-400 mt-0.5">@{user.username}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <FlameIcon size={13} className="text-amber-500" />
                <span className="text-xs text-ink-600 font-medium">{stats.streak} day streak</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-9 h-9 rounded-xl bg-ink-100 flex items-center justify-center text-ink-500 hover:text-ink-800 transition-colors"
          >
            <SettingsIcon size={17} />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mx-5 mb-5 card animate-slide-up">
          <p className="text-sm font-medium text-ink-700 mb-3">Settings</p>
          {[
            { label: 'Translation language', value: 'English (Sahih Intl.)' },
            { label: 'Reciter', value: 'Mishary Rashid Alafasy' },
            { label: 'Notification time', value: 'After Fajr (5:30 AM)' },
            { label: 'Arabic font size', value: 'Large' },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between py-3 border-b border-ink-50 last:border-0">
              <span className="text-sm text-ink-600">{s.label}</span>
              <div className="flex items-center gap-1.5 text-ink-400">
                <span className="text-xs">{s.value}</span>
                <ChevronRightIcon size={13} />
              </div>
            </div>
          ))}
          <button className="mt-4 text-sm text-alert font-medium">Sign out</button>
        </div>
      )}

      <div className="px-5 space-y-5">
        {/* Tabs */}
        <div className="flex bg-ink-100 rounded-xl p-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {activeTab === 'Stats' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Current streak" value={stats.streak} unit="days" />
              <StatCard label="Personal best" value={stats.longest} unit="days" />
              <StatCard label="Ayahs read" value={stats.ayahs} />
              <StatCard label="Active days" value={stats.days} />
            </div>

            <div className="card">
              <p className="text-sm font-medium text-ink-700 mb-4">Circles</p>
              {[
                { name: 'Al-Noor Family', streak: 47, members: 4 },
                { name: 'University Friends', streak: 12, members: 6 },
              ].map(c => (
                <div key={c.name} className="flex items-center justify-between py-3 border-b border-ink-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-ink-800">{c.name}</p>
                    <p className="text-xs text-ink-400">{c.members} members</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600">
                    <FlameIcon size={13} />
                    <span className="text-sm font-medium">{c.streak}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Milestone progress */}
            <div className="card">
              <p className="text-sm font-medium text-ink-700 mb-4">Next milestone</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-ink-500">Day {stats.streak}</span>
                <span className="text-xs text-ink-500 font-medium">Day 100 ✦</span>
              </div>
              <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-400 rounded-full transition-all duration-700"
                  style={{ width: `${(stats.streak / 100) * 100}%` }}
                />
              </div>
              <p className="text-xs text-ink-400 mt-2">{100 - stats.streak} days to your 100-day milestone</p>
            </div>
          </div>
        )}

        {/* Journal tab */}
        {activeTab === 'Journal' && (
          <div className="card animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <ScrollIcon size={15} className="text-ink-400" />
              <p className="text-sm font-medium text-ink-600">Your reflections</p>
            </div>
            {journal.length > 0 ? (
              journal.map(entry => <JournalEntry key={entry.id} entry={entry} />)
            ) : (
              <div className="py-10 text-center">
                <p className="text-3xl mb-3">📜</p>
                <p className="text-sm text-ink-500">No reflections yet.</p>
                <p className="text-xs text-ink-400 mt-1">After checking in, add a reflection to build your journal.</p>
              </div>
            )}
          </div>
        )}

        {/* Bookmarks tab */}
        {activeTab === 'Bookmarks' && (
          <div className="card animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <BookmarkIcon size={15} className="text-ink-400" />
              <p className="text-sm font-medium text-ink-600">{bookmarks.length} saved verses</p>
            </div>
            {bookmarks.map(b => <BookmarkItem key={b.id} bookmark={b} />)}
          </div>
        )}
      </div>

      <div className="h-8" />
    </div>
  );
}
