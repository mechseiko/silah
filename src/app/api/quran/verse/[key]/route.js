// app/api/quran/verse/[key]/route.js
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const verseKey = params.key; // e.g. "2:255"
  const { searchParams } = new URL(request.url);
  const translationId = searchParams.get('translation') || '131';

  try {
    const [verseRes, chapRes] = await Promise.all([
      fetch(`https://api.qurancdn.com/api/qdc/verses/by_key/${verseKey}?translations=${translationId}&language=en&fields=text_uthmani,verse_key,chapter_id,verse_number`),
      fetch(`https://api.qurancdn.com/api/qdc/chapters/${verseKey.split(':')[0]}?language=en`),
    ]);

    const [verseData, chapData] = await Promise.all([verseRes.json(), chapRes.json()]);

    return NextResponse.json({
      verse: verseData.verse,
      chapter: chapData.chapter,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch verse' }, { status: 500 });
  }
}
