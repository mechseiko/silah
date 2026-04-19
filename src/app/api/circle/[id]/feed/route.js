// app/api/circle/[id]/feed/route.js
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  const circleId = params.id;
  const supabase = createServiceClient();

  const { data: feed, error } = await supabase
    .from('checkins')
    .select(`
      id, date, checked_in_at, verse_key,
      profiles(id, display_name, avatar_seed),
      reflections(body)
    `)
    .eq('circle_id', circleId)
    .order('checked_in_at', { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ feed: feed || [] });
}
