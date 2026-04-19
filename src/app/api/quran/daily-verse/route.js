// app/api/quran/daily-verse/route.js
import { NextResponse } from 'next/server';
import { getDailyVerseKey } from '@/lib/quran';

export async function GET() {
  try {
    const verseKey = getDailyVerseKey();
    const [chapter, verse] = verseKey.split(':');

    // Fetch from quran.com public API (no auth needed for content)
    const [verseRes, audioRes, tafsirRes] = await Promise.all([
      fetch(`https://api.qurancdn.com/api/qdc/verses/by_key/${verseKey}?translations=131&language=en&fields=text_uthmani,verse_key,chapter_id,verse_number`),
      fetch(`https://api.qurancdn.com/api/qdc/recitations/7/by_ayah/${verseKey}`),
      fetch(`https://api.qurancdn.com/api/qdc/tafsirs/169/by_ayah/${verseKey}?language=en`),
    ]);

    const [verseData, audioData, tafsirData] = await Promise.all([
      verseRes.json(),
      audioRes.json(),
      tafsirRes.json(),
    ]);

    // Chapter info
    const chapRes = await fetch(`https://api.qurancdn.com/api/qdc/chapters/${chapter}?language=en`);
    const chapData = await chapRes.json();

    return NextResponse.json({
      verseKey,
      verse: verseData.verse,
      chapter: chapData.chapter,
      audio: audioData.audio_files?.[0] || null,
      tafsir: tafsirData.tafsir || null,
      date: new Date().toISOString().split('T')[0],
    });
  } catch (err) {
    console.error('Daily verse error:', err);
    return NextResponse.json({ error: 'Failed to fetch daily verse' }, { status: 500 });
  }
}
