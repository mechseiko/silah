// app/api/user/profile/route.js
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/quranUserApi';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single();

  return NextResponse.json({ profile });
}

export async function PUT(request) {
  const body = await request.json();
  const { displayName, level, quranLang } = body;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      quran_lang: quranLang || 'en',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
