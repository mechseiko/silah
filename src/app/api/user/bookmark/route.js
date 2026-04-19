// app/api/user/bookmark/route.js
import { NextResponse } from 'next/server';
import { addBookmark, getBookmarks } from '@/lib/quranUserApi';
import { createServiceClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('qf_access_token')?.value;
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false });

  return NextResponse.json({ bookmarks: data || [] });
}

export async function POST(request) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('qf_access_token')?.value;

  const body = await request.json();
  const { verseKey } = body;

  const supabase = createServiceClient();

  // Save to Supabase
  const { data: bookmark } = await supabase
    .from('bookmarks')
    .upsert({ verse_key: verseKey }, { onConflict: 'user_id,verse_key' })
    .select()
    .single();

  // Sync to Quran Foundation if token available
  if (accessToken) {
    try {
      const qfBookmark = await addBookmark(accessToken, verseKey);
      if (qfBookmark?.id) {
        await supabase
          .from('bookmarks')
          .update({ qf_bookmark_id: qfBookmark.id })
          .eq('id', bookmark.id);
      }
    } catch (e) {
      console.warn('QF bookmark sync failed:', e.message);
    }
  }

  return NextResponse.json({ success: true, bookmark });
}
