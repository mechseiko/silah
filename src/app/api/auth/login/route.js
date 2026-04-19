// app/api/auth/login/route.js
// Server-side: returns the auth URL for client to redirect to

import { NextResponse } from 'next/server';

export async function GET() {
  // PKCE is generated client-side in the browser
  // This endpoint just confirms the config is valid
  return NextResponse.json({
    clientId: process.env.QURAN_OAUTH_CLIENT_ID,
    redirectUri: process.env.QURAN_OAUTH_REDIRECT_URI,
    scopes: [
      'openid', 'offline_access', 'user',
      'bookmark', 'collection', 'reading_session',
      'preference', 'goal', 'streak',
    ],
  });
}
