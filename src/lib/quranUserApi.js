// lib/quranUserApi.js
// All calls go server-side — CLIENT_SECRET never exposed to browser

const USER_API_BASE = 'https://apis.quran.foundation/auth/v1';

// Dynamically uses pre-production or production OAuth endpoint
const OAUTH_BASE = process.env.QURAN_OAUTH_BASE_URL || 'https://prelive-oauth2.quran.foundation';
const OAUTH_TOKEN_URL = `${OAUTH_BASE}/oauth2/token`;

// ── Token management (server-side only) ─────────────────────────
export async function exchangeCodeForTokens({ code, codeVerifier, redirectUri }) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.QURAN_OAUTH_CLIENT_ID,
    client_secret: process.env.QURAN_OAUTH_CLIENT_SECRET,
    code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
  });

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }
  return res.json();
}

export async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.QURAN_OAUTH_CLIENT_ID,
    client_secret: process.env.QURAN_OAUTH_CLIENT_SECRET,
    refresh_token: refreshToken,
  });

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  return res.json();
}

// ── Generic authenticated fetch ──────────────────────────────────
async function userApiFetch(path, accessToken, options = {}) {
  const res = await fetch(`${USER_API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': accessToken,
      'x-client-id': process.env.QURAN_OAUTH_CLIENT_ID,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`User API error ${res.status}: ${err}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ── Streaks ──────────────────────────────────────────────────────
export async function getStreaks(accessToken) {
  return userApiFetch('/streaks', accessToken);
}

export async function getCurrentStreak(accessToken) {
  return userApiFetch('/streaks/current', accessToken);
}

// ── Activity days ────────────────────────────────────────────────
export async function addActivityDay(accessToken, { date, secondsRead = 60 }) {
  return userApiFetch('/activity-days', accessToken, {
    method: 'POST',
    body: JSON.stringify({ date_iso8601: date, seconds_read: secondsRead }),
  });
}

export async function getActivityDays(accessToken, { startDate, endDate }) {
  const params = new URLSearchParams({ from: startDate, to: endDate });
  return userApiFetch(`/activity-days?${params}`, accessToken);
}

// ── Bookmarks ────────────────────────────────────────────────────
export async function getBookmarks(accessToken) {
  return userApiFetch('/bookmarks', accessToken);
}

export async function addBookmark(accessToken, verseKey) {
  return userApiFetch('/bookmarks', accessToken, {
    method: 'POST',
    body: JSON.stringify({ verse_key: verseKey }),
  });
}

export async function deleteBookmark(accessToken, bookmarkId) {
  return userApiFetch(`/bookmarks/${bookmarkId}`, accessToken, { method: 'DELETE' });
}

// ── Collections ──────────────────────────────────────────────────
export async function getCollections(accessToken) {
  return userApiFetch('/collections', accessToken);
}

export async function createCollection(accessToken, { name, description }) {
  return userApiFetch('/collections', accessToken, {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function addToCollection(accessToken, collectionId, verseKey) {
  return userApiFetch(`/collections/${collectionId}/bookmarks`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ verse_key: verseKey }),
  });
}

// ── Goals ────────────────────────────────────────────────────────
export async function createGoal(accessToken, { type, pages, duration }) {
  // type: 'page' | 'time'
  return userApiFetch('/goals', accessToken, {
    method: 'POST',
    body: JSON.stringify({ type, pages, duration }),
  });
}

export async function getTodayGoalPlan(accessToken) {
  return userApiFetch('/goals/today', accessToken);
}

// ── Posts / Reflections ──────────────────────────────────────────
export async function createPost(accessToken, { body, verseKey, roomId }) {
  return userApiFetch('/posts', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      body,
      verse_key: verseKey,
      room_id: roomId,
      visibility: 'private', // within circle only
    }),
  });
}

export async function getUserPosts(accessToken) {
  return userApiFetch('/posts/me', accessToken);
}

// ── Rooms (Circles) ──────────────────────────────────────────────
export async function createRoom(accessToken, { name, description }) {
  return userApiFetch('/rooms/group', accessToken, {
    method: 'POST',
    body: JSON.stringify({ name, description, visibility: 'private' }),
  });
}

export async function getRooms(accessToken) {
  return userApiFetch('/rooms', accessToken);
}

export async function getRoomById(accessToken, roomId) {
  return userApiFetch(`/rooms/${roomId}`, accessToken);
}

export async function getRoomMembers(accessToken, roomId) {
  return userApiFetch(`/rooms/${roomId}/members`, accessToken);
}

export async function inviteToRoom(accessToken, roomId, username) {
  return userApiFetch(`/rooms/${roomId}/invite`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export async function joinRoom(accessToken, roomId) {
  return userApiFetch(`/rooms/${roomId}/join`, accessToken, { method: 'POST' });
}

export async function getRoomPosts(accessToken, roomId) {
  return userApiFetch(`/rooms/${roomId}/posts`, accessToken);
}

// ── User profile ─────────────────────────────────────────────────
export async function getUserProfile(accessToken) {
  return userApiFetch('/users/profile', accessToken);
}

export async function updateUserProfile(accessToken, data) {
  return userApiFetch('/users/profile', accessToken, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Reading session ──────────────────────────────────────────────
export async function addReadingSession(accessToken, { chapterId, verseNumber, duration }) {
  return userApiFetch('/reading-sessions', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      chapter_id: chapterId,
      verse_number: verseNumber,
      duration_in_seconds: duration,
    }),
  });
}
