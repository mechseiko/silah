'use client';
import { useState, useEffect } from 'react';
import StreakHeatmap from '@/components/habit/StreakHeatmap';
import Avatar from '@/components/ui/Avatar';
import { buildHeatmapData } from '@/lib/utils';
import { CopyIcon, CheckIcon, UsersIcon, FlameIcon, ShareIcon } from 'lucide-react';

const MILESTONES = [7, 30, 100, 365];

function MemberCard({ member, streak }) {
  const name = member.profiles?.display_name || 'Friend';
  return (
    <div className="flex items-center gap-3 py-3 border-b border-ink-50 last:border-0">
      <Avatar name={name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-800 truncate">{name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <div className={`w-2 h-2 rounded-full ${member.checked_today ? 'bg-primary-400' : 'bg-ink-200'}`} />
          <span className="text-xs text-ink-500">
            {member.checked_today ? 'Read today' : 'Not yet today'}
          </span>
        </div>
      </div>
      {streak > 0 && (
        <div className="flex items-center gap-1 text-amber-600">
          <FlameIcon size={13} />
          <span className="text-xs font-medium">{streak}</span>
        </div>
      )}
    </div>
  );
}

export default function CirclePage() {
  const [circle, setCircle] = useState(null);
  const [members, setMembers] = useState([]);
  const [heatmapDays, setHeatmapDays] = useState([]);
  const [copied, setCopied] = useState(false);
  const [groupStreak, setGroupStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCircleData() {
      try {
        // Fetch user's circle data
        const res = await fetch('/api/circle');
        const data = await res.json();
        
        if (data.circle) {
          setCircle(data.circle);
          setMembers(data.members || []);
          setHeatmapDays(buildHeatmapData(data.checkins || [], null));
          setGroupStreak(data.groupStreak || 0);
        }
      } catch (err) {
        console.error('Failed to fetch circle data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCircleData();
  }, []);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(`Join my Quran circle on Silah! Code: ${circle?.invite_code}\nsilah.app/join/${circle?.invite_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkedInToday = members.filter(m => m.checked_today).length;
  const nextMilestone = MILESTONES.find(m => m > groupStreak) || 365;

  return (
    <div className="page-enter">
      <div className="px-5 pt-12 pb-6">
        <p className="text-xs font-medium text-ink-400 uppercase tracking-widest mb-1">Your circle</p>
        <h1 className="text-2xl font-display font-semibold text-ink-900">
          {loading ? '…' : circle?.name}
        </h1>
      </div>

      <div className="px-5 space-y-5">
        {/* Group streak */}
        <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-primary-100 mb-1">Group streak</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-semibold">{groupStreak}</span>
                <span className="text-lg text-primary-200">days</span>
              </div>
              <p className="text-sm text-primary-100 mt-2">
                {nextMilestone - groupStreak} days to {nextMilestone}-day milestone ✦
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-100">Today</p>
              <p className="text-2xl font-semibold">{checkedInToday}/{members.length}</p>
              <p className="text-xs text-primary-200">checked in</p>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="card">
          <h2 className="text-sm font-medium text-ink-600 mb-4">90-day activity</h2>
          <StreakHeatmap days={heatmapDays} totalMembers={members.length} />
        </div>

        {/* Members */}
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <UsersIcon size={15} className="text-ink-400" />
            <h2 className="text-sm font-medium text-ink-600">{members.length} members</h2>
          </div>
          {members.map(m => (
            <MemberCard key={m.id} member={m} streak={Math.floor(Math.random() * 50)} />
          ))}
        </div>

        {/* Invite */}
        <div className="card-sm">
          <p className="text-xs text-ink-500 mb-3">Invite someone to your circle</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-ink-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl font-mono font-semibold text-ink-800 tracking-widest">
                {circle?.invite_code}
              </span>
            </div>
            <button
              onClick={copyInviteCode}
              className={`px-4 rounded-xl flex items-center gap-2 text-sm font-medium transition-all
                ${copied ? 'bg-primary-400 text-white' : 'btn-ghost'}`}
            >
              {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-ink-400 mt-2">
            Share this code. Max 7 members per circle.
          </p>
        </div>
      </div>
    </div>
  );
}
