# Silah — صلة
### The Quran Accountability Circle App

> *"Silah" (صلة) means bond, connection, and continuity in Arabic — the word for kinship ties in Islam.*
---

## What is Silah?

Silah solves the core hackathon challenge: **millions reconnect with the Quran during Ramadan but struggle to maintain that connection afterwards.**

The solution is a group accountability app where small circles of 2–7 people, family, friends, study groups, stay connected to the Quran year-round through:

- **Shared streaks** — the whole group earns a streak when everyone checks in
- **Daily verse** — same verse for the entire circle, fetched from Quran Foundation APIs
- **Circle chat** — real-time messaging with verse-sharing built in
- **Personal journal** — reflections tied to each day's verse, archived forever
- **Habit engine** — streaks, goals, milestones, grace days via Quran Foundation User APIs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) · JavaScript · Tailwind CSS |
| Backend | Next.js API Routes (server-side only for secrets) |
| Database | Supabase (Postgres + Auth + Realtime) |
| Content APIs | `@quranjs/api` SDK — Quran, Audio, Tafsir, Translation |
| User APIs | Quran Foundation User API — Streaks, Bookmarks, Goals, Posts, Rooms |
| Auth | Quran Foundation OAuth2 + PKCE (OIDC) |
| Hosting | Vercel |

---

## Quran Foundation APIs Used

### Content APIs ✦
| API | Usage |
|---|---|
| Quran API | Daily verse text (Uthmani script) |
| Audio API | Recitation audio per verse (Mishary Alafasy) |
| Tafsir API | Ibn Kathir tafsir for daily verse |
| Translation API | Sahih International + multilingual support |

### User APIs ✦
| API | Usage |
|---|---|
| Streak Tracking API | Personal streak display and sync |
| Activity Days API | Records each daily check-in |
| Bookmarks API | Saves bookmarked verses |
| Collections API | Organizes bookmarks into named collections |
| Reading Sessions API | Logs reading session per check-in |
| Goals API | Sets and tracks weekly reading goals |
| Posts API | Saves reflections tied to verse + circle |
| Rooms API | Powers circle groups (Quran Foundation groups) |

---
