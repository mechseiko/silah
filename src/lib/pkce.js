// lib/pkce.js — runs in browser to generate PKCE params
// SERVER never sees the code_verifier until the exchange

export async function generatePKCE() {
  // code_verifier: random 43-128 char string
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = base64UrlEncode(array);

  // code_challenge: SHA-256 of verifier
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const codeChallenge = base64UrlEncode(new Uint8Array(digest));

  return { codeVerifier, codeChallenge };
}

export function generateState() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Build the authorization URL — uses pre-production or production endpoint
export function buildAuthUrl({ clientId, redirectUri, codeChallenge, state, scopes }) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    scope: scopes.join(' '),
  });

  // Pre-production: https://prelive-oauth2.quran.foundation/oauth2/auth
  // Production:     https://oauth2.quran.foundation/oauth2/auth
  const oauthBase = process.env.NEXT_PUBLIC_QURAN_OAUTH_BASE_URL
    || 'https://prelive-oauth2.quran.foundation';

  return `${oauthBase}/oauth2/auth?${params}`;
}
