-- ═══════════════════════════════════════════════════════════════
-- SILAH — Supabase Database Schema
-- Paste this into Supabase → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────────────
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null default 'Friend',
  username      text unique,
  avatar_seed   text default 'default',
  qf_user_id    text,              -- Quran Foundation user sub from id_token
  quran_lang    text default 'en', -- preferred translation language
  created_at    timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can read all profiles" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;

create policy "Users can read all profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    lower(replace(split_part(new.email, '@', 1), '.', '_')) || '_' || substr(new.id::text, 1, 4)
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Circles ────────────────────────────────────────────────────────
create table if not exists circles (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  description   text,
  invite_code   text unique not null,
  qf_room_id    text,              -- Quran Foundation room id (optional)
  created_by    uuid references profiles(id),
  created_at    timestamptz default now()
);

alter table circles enable row level security;

-- Note: Policies will be created after circle_members table to avoid circular dependency

-- ── Circle members ─────────────────────────────────────────────────
create table if not exists circle_members (
  id         uuid primary key default uuid_generate_v4(),
  circle_id  uuid not null references circles(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  role       text not null default 'member', -- 'admin' | 'member'
  joined_at  timestamptz default now(),
  unique(circle_id, user_id)
);

alter table circle_members enable row level security;

drop policy if exists "Members can view their circle memberships" on circle_members;
drop policy if exists "Authenticated users can join circles" on circle_members;

create policy "Members can view their circle memberships"
  on circle_members for select
  using (user_id = auth.uid() or circle_id in (
    select circle_id from circle_members where user_id = auth.uid()
  ));

create policy "Authenticated users can join circles"
  on circle_members for insert with check (auth.uid() = user_id);

-- Now add circles policies (deferred to avoid circular dependency)
drop policy if exists "Circle members can view their circles" on circles;
drop policy if exists "Authenticated users can create circles" on circles;

create policy "Circle members can view their circles"
  on circles for select
  using (
    id in (select circle_id from circle_members where user_id = auth.uid())
  );

create policy "Authenticated users can create circles"
  on circles for insert with check (auth.uid() is not null);

-- ── Check-ins ──────────────────────────────────────────────────────
create table if not exists checkins (
  id             uuid primary key default uuid_generate_v4(),
  circle_id      uuid not null references circles(id) on delete cascade,
  user_id        uuid not null references profiles(id) on delete cascade,
  verse_key      text not null,
  date           date not null default current_date,
  checked_in_at  timestamptz default now(),
  unique(circle_id, user_id, date)
);

alter table checkins enable row level security;

drop policy if exists "Circle members can view checkins" on checkins;
drop policy if exists "Users can insert own checkins" on checkins;

create policy "Circle members can view checkins"
  on checkins for select
  using (circle_id in (
    select circle_id from circle_members where user_id = auth.uid()
  ));

create policy "Users can insert own checkins"
  on checkins for insert with check (user_id = auth.uid());

-- Index for heatmap queries
create index if not exists checkins_circle_date on checkins(circle_id, date);

-- ── Reflections ────────────────────────────────────────────────────
create table if not exists reflections (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  circle_id   uuid references circles(id) on delete cascade,
  verse_key   text not null,
  body        text not null,
  date        date not null default current_date,
  created_at  timestamptz default now()
);

alter table reflections enable row level security;

drop policy if exists "Circle members can view reflections" on reflections;
drop policy if exists "Users can insert own reflections" on reflections;

create policy "Circle members can view reflections"
  on reflections for select
  using (
    circle_id is null
    or circle_id in (select circle_id from circle_members where user_id = auth.uid())
  );

create policy "Users can insert own reflections"
  on reflections for insert with check (user_id = auth.uid());

-- ── Circle messages (simple chat) ──────────────────────────────────
create table if not exists circle_messages (
  id            uuid primary key default uuid_generate_v4(),
  circle_id     uuid not null references circles(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  body          text,
  verse_key     text,            -- if sharing a verse
  reply_to_id   uuid references circle_messages(id),
  created_at    timestamptz default now()
);

alter table circle_messages enable row level security;

drop policy if exists "Circle members can view messages" on circle_messages;
drop policy if exists "Circle members can send messages" on circle_messages;

create policy "Circle members can view messages"
  on circle_messages for select
  using (circle_id in (
    select circle_id from circle_members where user_id = auth.uid()
  ));

create policy "Circle members can send messages"
  on circle_messages for insert
  with check (
    user_id = auth.uid()
    and circle_id in (select circle_id from circle_members where user_id = auth.uid())
  );

-- Enable realtime for chat
alter publication supabase_realtime drop table circle_messages;
alter publication supabase_realtime drop table checkins;
alter publication supabase_realtime add table circle_messages;
alter publication supabase_realtime add table checkins;

-- ── Bookmarks (local mirror) ───────────────────────────────────────
create table if not exists bookmarks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  verse_key   text not null,
  qf_bookmark_id text,           -- ID from Quran Foundation
  created_at  timestamptz default now(),
  unique(user_id, verse_key)
);

alter table bookmarks enable row level security;

drop policy if exists "Users can manage own bookmarks" on bookmarks;

create policy "Users can manage own bookmarks"
  on bookmarks for all using (user_id = auth.uid());

-- ── Streak cache (local) ────────────────────────────────────────────
-- We cache QF streak data locally for quick display
create table if not exists streak_cache (
  user_id         uuid primary key references profiles(id) on delete cascade,
  current_streak  int default 0,
  longest_streak  int default 0,
  last_synced_at  timestamptz default now()
);

alter table streak_cache enable row level security;

drop policy if exists "Users manage own streak cache" on streak_cache;

create policy "Users manage own streak cache"
  on streak_cache for all using (user_id = auth.uid());

-- ── Helper view: circle with today's status ─────────────────────────
create or replace view circle_today_status as
select
  c.id as circle_id,
  c.name,
  c.invite_code,
  count(distinct cm.user_id) as total_members,
  count(distinct ch.user_id) as checked_in_today,
  count(distinct cm.user_id) = count(distinct ch.user_id) as all_checked_in
from circles c
left join circle_members cm on cm.circle_id = c.id
left join checkins ch on ch.circle_id = c.id and ch.date = current_date
group by c.id, c.name, c.invite_code;
