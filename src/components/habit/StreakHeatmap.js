'use client';

const INTENSITY = ['bg-ink-100', 'bg-primary-200', 'bg-primary-400', 'bg-primary-600', 'bg-primary-800'];

function getIntensity(count, max) {
  if (count === 0) return INTENSITY[0];
  const ratio = count / Math.max(max, 1);
  if (ratio <= 0.25) return INTENSITY[1];
  if (ratio <= 0.5) return INTENSITY[2];
  if (ratio <= 0.75) return INTENSITY[3];
  return INTENSITY[4];
}

export default function StreakHeatmap({ days = [], totalMembers = 1 }) {
  if (!days.length) return null;

  const max = totalMembers;

  // Group into weeks
  const weeks = [];
  let week = [];
  days.forEach((d, i) => {
    week.push(d);
    if (week.length === 7 || i === days.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((wk, wi) => (
          <div key={wi} className="flex flex-col gap-1 flex-shrink-0">
            {wk.map((day, di) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count}/${totalMembers} checked in`}
                className={`w-3 h-3 rounded-sm transition-all ${getIntensity(day.count, max)}
                  ${day.date === today ? 'ring-1 ring-primary-600 ring-offset-1' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-ink-400">Less</span>
        {INTENSITY.map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span className="text-xs text-ink-400">More</span>
      </div>
    </div>
  );
}
