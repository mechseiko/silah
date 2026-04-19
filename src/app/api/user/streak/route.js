// app/api/user/streak/route.js
import { NextResponse } from 'next/server';
import { getStreaks, getCurrentStreak } from '@/lib/quranUserApi';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('qf_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ streak: 0, longestStreak: 0 });
  }

  try {
    const [current, all] = await Promise.all([
      getCurrentStreak(accessToken),
      getStreaks(accessToken),
    ]);

    return NextResponse.json({
      currentStreak: current?.current_streak_days || 0,
      longestStreak: all?.max_streak_days || 0,
      lastActivityDay: all?.last_activity_day || null,
    });
  } catch (err) {
    console.error('Streak fetch error:', err);
    return NextResponse.json({ currentStreak: 0, longestStreak: 0 });
  }
}
