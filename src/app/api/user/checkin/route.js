// app/api/user/checkin/route.js
import { NextResponse } from 'next/server';
import { addActivityDay, addReadingSession } from '@/lib/quranUserApi';
import { createServiceClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('qf_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { verseKey, circleId, reflection } = body;

  const today = new Date().toISOString().split('T')[0];

  try {
    // 1. Record activity day with Quran Foundation
    await addActivityDay(accessToken, { date: today, secondsRead: 120 });

    // 2. Record reading session
    const [chapter, verseNum] = (verseKey || '1:1').split(':');
    await addReadingSession(accessToken, {
      chapterId: parseInt(chapter),
      verseNumber: parseInt(verseNum),
      duration: 120,
    });

    // 3. Store check-in in Supabase for circle feed
    const supabase = createServiceClient();
    const { data: checkin, error } = await supabase
      .from('checkins')
      .upsert({
        circle_id: circleId,
        verse_key: verseKey,
        checked_in_at: new Date().toISOString(),
        date: today,
      }, { onConflict: 'circle_id,user_id,date' })
      .select()
      .single();

    if (error) throw error;

    // 4. Save reflection as a post if provided
    if (reflection?.trim()) {
      await supabase.from('reflections').insert({
        circle_id: circleId,
        verse_key: verseKey,
        body: reflection.trim(),
        date: today,
      });
    }

    return NextResponse.json({ success: true, checkin });
  } catch (err) {
    console.error('Check-in error:', err);
    return NextResponse.json({ error: 'Check-in failed', detail: err.message }, { status: 500 });
  }
}
