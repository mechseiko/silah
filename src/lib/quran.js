// lib/quran.js — wrapper around @quranjs/api SDK
// This runs server-side only (API routes) to protect credentials

let _client = null;

function getClient() {
  if (_client) return _client;
  const { QuranClient, Language } = require('@quranjs/api');
  _client = new QuranClient({
    clientId: process.env.QURAN_CLIENT_ID,       // c9555a0c-369e-4f7d-a0a3-e199dc2597d6
    clientSecret: process.env.QURAN_CLIENT_SECRET, // kd8C-5ngSsigNSirZBxZSVh1bd
    defaults: { language: Language.ENGLISH },
  });
  return _client;
}

// ── Verses ──────────────────────────────────────────────────────
export async function getVerseByKey(verseKey, opts = {}) {
  const client = getClient();
  return client.verses.findByKey(verseKey, {
    translations: [131], // Sahih International
    words: false,
    ...opts,
  });
}

export async function getVersesByChapter(chapterId, opts = {}) {
  const client = getClient();
  return client.verses.findAllByChapter(chapterId, {
    translations: [131],
    words: false,
    perPage: 50,
    ...opts,
  });
}

export async function getRandomVerse() {
  // Use the REST endpoint — SDK may not expose random
  const res = await fetch(
    'https://api.qurancdn.com/api/qdc/verses/random?translations=131&language=en',
  );
  return res.json();
}

// ── Chapters ─────────────────────────────────────────────────────
export async function getAllChapters(language = 'en') {
  const client = getClient();
  return client.chapters.findAll({ language });
}

export async function getChapter(id) {
  const client = getClient();
  return client.chapters.findById(id);
}

// ── Audio ──────────────────────────────────────────────────────────
export async function getVerseAudio(chapterId, verseNumber) {
  const client = getClient();
  // recitationId 7 = Mishary Rashid Alafasy
  return client.audio.findAllAyahAudioOfSurah(7, chapterId);
}

// ── Tafsir ─────────────────────────────────────────────────────────
export async function getTafsirForVerse(verseKey) {
  // tafsir 169 = Tafsir Ibn Kathir (English)
  const [chapter, verse] = verseKey.split(':');
  const res = await fetch(
    `https://api.qurancdn.com/api/qdc/tafsirs/169/by_ayah/${chapter}:${verse}?language=en`,
  );
  return res.json();
}

// ── Translations ───────────────────────────────────────────────────
export async function getTranslations() {
  const client = getClient();
  return client.resources.findAllTranslations();
}

// ── Daily verse logic ──────────────────────────────────────────────
// Deterministic: day 1 of Silah = 1:1, progresses sequentially
const TOTAL_VERSES = 6236;
const SILAH_EPOCH = new Date('2026-04-01'); // App launch date

export function getDailyVerseKey() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceEpoch = Math.floor((today - SILAH_EPOCH) / 86400000);
  const verseIndex = (daysSinceEpoch % TOTAL_VERSES) + 1;

  // Map linear index to chapter:verse
  // Simplified mapping using known surah lengths
  return linearIndexToVerseKey(verseIndex);
}

// Surah verse counts (114 surahs)
const SURAH_LENGTHS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,28,28,20,56,40,31,50,45,33,27,57,29,19,18,46,27,33,20,66,21,36,14,15,13,6,11,11,18,14,9,10,14,4,11,15,16,13,6,6,19,18,12,12,6,12];

function linearIndexToVerseKey(n) {
  let remaining = n;
  for (let s = 0; s < SURAH_LENGTHS.length; s++) {
    if (remaining <= SURAH_LENGTHS[s]) {
      return `${s + 1}:${remaining}`;
    }
    remaining -= SURAH_LENGTHS[s];
  }
  return '1:1';
}
