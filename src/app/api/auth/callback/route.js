// app/api/auth/callback/route.js
import { NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/quranUserApi';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (error) {
    return NextResponse.redirect(`${appUrl}/login?error=${error}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/login?error=missing_params`);
  }

  try {
    // code_verifier was stored in Supabase session cookie before redirect
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    // For the hackathon demo we store code_verifier in a cookie set during login
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    const codeVerifier = cookieStore.get('pkce_code_verifier')?.value;
    const savedState = cookieStore.get('oauth_state')?.value;

    if (state !== savedState) {
      return NextResponse.redirect(`${appUrl}/login?error=state_mismatch`);
    }

    const tokens = await exchangeCodeForTokens({
      code,
      codeVerifier,
      redirectUri: process.env.QURAN_OAUTH_REDIRECT_URI,
    });

    // Store tokens server-side in Supabase user metadata
    // In production: encrypt and store in DB. For hackathon: session cookie.
    const response = NextResponse.redirect(`${appUrl}/home`);

    response.cookies.set('qf_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokens.expires_in,
      path: '/',
    });

    response.cookies.set('qf_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Clear PKCE cookies
    response.cookies.delete('pkce_code_verifier');
    response.cookies.delete('oauth_state');

    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(`${appUrl}/login?error=token_exchange_failed`);
  }
}
