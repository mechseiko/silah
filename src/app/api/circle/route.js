// app/api/circle/route.js
import { NextResponse } from 'next/server';
import { createRoom, getRooms } from '@/lib/quranUserApi';
import { createServiceClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// GET /api/circle — list user's circles
export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('qf_access_token')?.value;
  const supabase = createServiceClient();

  // Get circles from Supabase (richer data than rooms API for our purposes)
  const { data: circles, error } = await supabase
    .from('circles')
    .select(`
      *,
      circle_members(count),
      checkins(date, user_id)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ circles: circles || [] });
}

// POST /api/circle — create a new circle
export async function POST(request) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('qf_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description } = body;

  try {
    // 1. Create room in Quran Foundation (for post integration)
    let qfRoom = null;
    try {
      qfRoom = await createRoom(accessToken, { name, description });
    } catch (e) {
      // QF room creation is optional for hackathon — store locally if fails
      console.warn('QF room creation skipped:', e.message);
    }

    // 2. Create circle in Supabase (primary store)
    const supabase = createServiceClient();
    const inviteCode = generateInviteCode();

    const { data: circle, error } = await supabase
      .from('circles')
      .insert({
        name,
        description,
        invite_code: inviteCode,
        qf_room_id: qfRoom?.id || null,
      })
      .select()
      .single();

    if (error) throw error;

    // 3. Add creator as member
    await supabase.from('circle_members').insert({
      circle_id: circle.id,
      role: 'admin',
    });

    return NextResponse.json({ circle }, { status: 201 });
  } catch (err) {
    console.error('Create circle error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
