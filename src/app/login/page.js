'use client';
import { useState } from 'react';
import { generatePKCE, generateState, buildAuthUrl } from '@/lib/pkce';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Get config from server
      const configRes = await fetch('/api/auth/login');
      const config = await configRes.json();

      // 2. Generate PKCE + state in browser
      const { codeVerifier, codeChallenge } = await generatePKCE();
      const state = generateState();

      // 3. Store verifier + state in cookies (sent to server on callback)
      document.cookie = `pkce_code_verifier=${codeVerifier}; path=/; max-age=600; samesite=lax`;
      document.cookie = `oauth_state=${state}; path=/; max-age=600; samesite=lax`;

      // 4. Build auth URL and redirect
      const authUrl = buildAuthUrl({
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        codeChallenge,
        state,
        scopes: config.scopes,
      });

      window.location.href = authUrl;
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center px-6">
      {/* Logo mark */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-400/20">
          <svg viewBox="0 0 40 40" fill="none" className="w-11 h-11">
            <circle cx="12" cy="20" r="6" fill="white" opacity="0.95" />
            <circle cx="28" cy="12" r="6" fill="white" opacity="0.75" />
            <circle cx="28" cy="28" r="6" fill="white" opacity="0.75" />
            <line x1="17.5" y1="17" x2="22.5" y2="14" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="17.5" y1="23" x2="22.5" y2="26" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-4xl font-display font-semibold text-ink-900">Silah</h1>
        <p className="text-lg text-ink-500 mt-1 font-arabic" lang="ar">صلة</p>
        <p className="text-base text-ink-600 mt-4 leading-relaxed max-w-xs">
          Stay connected to the Quran with your circle — year-round, not just Ramadan.
        </p>
      </div>

      {/* Features list */}
      <div className="w-full max-w-xs space-y-3 mb-10">
        {[
          { icon: '🌿', text: 'Daily verse for your whole circle' },
          { icon: '🔥', text: 'Shared streaks that keep you accountable' },
          { icon: '💬', text: 'Circle chat with verse sharing' },
          { icon: '📜', text: 'Personal reflection journal' },
        ].map(f => (
          <div key={f.text} className="flex items-center gap-3">
            <span className="text-lg">{f.icon}</span>
            <span className="text-sm text-ink-600">{f.text}</span>
          </div>
        ))}
      </div>

      {/* Auth */}
      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-3 text-base py-4"
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
              Continue with Quran Foundation
            </>
          )}
        </button>

        {error && (
          <p className="text-sm text-alert text-center animate-fade-in">{error}</p>
        )}

        <p className="text-xs text-ink-400 text-center leading-relaxed">
          Silah uses your Quran.com account to sync your streaks, bookmarks, and reading history securely.
        </p>
      </div>
    </div>
  );
}
