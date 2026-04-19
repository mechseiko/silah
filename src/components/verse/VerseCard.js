'use client';
import { useState, useRef } from 'react';
import { BookmarkIcon, HeadphonesIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { getAudioUrl } from '@/lib/utils';

export default function VerseCard({ verse, chapter, audio, tafsir, onBookmark, isBookmarked }) {
  const [showTafsir, setShowTafsir] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showTranslit, setShowTranslit] = useState(false);
  const audioRef = useRef(null);

  const audioUrl = getAudioUrl(audio);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const verseText = verse?.translations?.[0]?.text || '';
  const arabicText = verse?.text_uthmani || '';
  const verseKey = verse?.verse_key || '';
  const surahName = chapter?.name_simple || '';

  return (
    <div className="verse-card animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-medium text-primary-600 uppercase tracking-widest">
            Today's verse
          </p>
          <p className="text-sm text-primary-800 mt-0.5 font-medium">
            Surah {surahName} · {verseKey}
          </p>
        </div>
        <div className="flex gap-2">
          {audioUrl && (
            <button
              onClick={toggleAudio}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all
                ${playing
                  ? 'bg-primary-400 text-white'
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                }`}
              aria-label={playing ? 'Pause recitation' : 'Play recitation'}
            >
              {playing ? (
                <span className="w-3 h-3 flex gap-0.5">
                  <span className="w-1 h-3 bg-white rounded-sm animate-pulse-soft" />
                  <span className="w-1 h-3 bg-white rounded-sm animate-pulse-soft" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1 h-3 bg-white rounded-sm animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
                </span>
              ) : (
                <HeadphonesIcon size={16} />
              )}
            </button>
          )}
          <button
            onClick={onBookmark}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all
              ${isBookmarked
                ? 'bg-gold-400/20 text-gold-600'
                : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark verse'}
          >
            <BookmarkIcon size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Arabic text */}
      <p
        className="arabic text-2xl text-ink-900 leading-loose text-right mb-5"
        lang="ar"
        dir="rtl"
      >
        {arabicText}
      </p>

      {/* Divider */}
      <div className="border-t border-primary-200 mb-4" />

      {/* Translation */}
      <p className="text-ink-800 text-base leading-relaxed font-display italic">
        {verseText.replace(/<[^>]+>/g, '')}
      </p>

      {/* Tafsir toggle */}
      {tafsir && (
        <div className="mt-5">
          <button
            onClick={() => setShowTafsir(!showTafsir)}
            className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-800 transition-colors"
          >
            {showTafsir ? <ChevronUpIcon size={15} /> : <ChevronDownIcon size={15} />}
            {showTafsir ? 'Hide tafsir' : 'Read tafsir'}
          </button>

          {showTafsir && (
            <div className="mt-3 p-4 bg-white rounded-xl border border-primary-100 animate-slide-up">
              <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2">
                Ibn Kathir
              </p>
              <p className="text-sm text-ink-700 leading-relaxed">
                {tafsir?.text?.replace(/<[^>]+>/g, '').slice(0, 400)}
                {tafsir?.text?.length > 400 && '…'}
              </p>
            </div>
          )}
        </div>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setPlaying(false)}
          preload="none"
        />
      )}
    </div>
  );
}
