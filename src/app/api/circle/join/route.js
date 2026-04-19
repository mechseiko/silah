// app/api/circle/join/route.js
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// GET — lookup circle by code (preview before joining)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.toUpperCase();

  if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 });

  const supabase = createServiceClient();
  const { data: circle } = await supabase
    .from('circles')
    .select('id, name, invite_code')
    .eq('invite_code', code)
    .single();

  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });

  // Get member count + streak
  const { count } = await supabase
    .from('circle_members')
    .select('*', { count: 'exact', head: true })
    .eq('circle_id', circle.id);

  return NextResponse.json({
    circle: { ...circle, member_count: count || 0, streak: 0 },
  });
}

// POST — join a circle
export async function POST(request) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('qf_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const code = body.inviteCode?.toUpperCase();

  const supabase = createServiceClient();

  const { data: circle } = await supabase
    .from('circles')
    .select('id')
    .eq('invite_code', code)
    .single();

  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });

  // Check capacity
  const { count } = await supabase
    .from('circle_members')
    .select('*', { count: 'exact', head: true })
    .eq('circle_id', circle.id);

  if (count >= 7) {
    return NextResponse.json({ error: 'Circle is full (max 7 members)' }, { status: 400 });
  }

  // Add member (upsert to avoid duplicate)
  const { error } = await supabase
    .from('circle_members')
    .upsert({ circle_id: circle.id, role: 'member' }, { onConflict: 'circle_id,user_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, circleId: circle.id });
}
