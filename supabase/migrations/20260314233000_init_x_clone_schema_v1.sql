create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null default 'user',
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_username_format_chk check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  constraint profiles_bio_length_chk check (char_length(bio) <= 160),
  constraint profiles_display_name_length_chk check (char_length(display_name) between 1 and 80)
);

create table if not exists public.tweets (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  reply_to_tweet_id uuid references public.tweets (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint tweets_content_length_chk check (char_length(trim(content)) between 1 and 280),
  constraint tweets_not_reply_to_self_chk check (reply_to_tweet_id is null or reply_to_tweet_id <> id)
);

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint follows_no_self_follow_chk check (follower_id <> following_id),
  constraint follows_unique_pair_uq unique (follower_id, following_id)
);

create index if not exists tweets_created_at_idx
  on public.tweets (created_at desc);

create index if not exists tweets_author_created_at_idx
  on public.tweets (author_id, created_at desc);

create index if not exists tweets_reply_to_tweet_id_idx
  on public.tweets (reply_to_tweet_id);

create index if not exists follows_follower_id_idx
  on public.follows (follower_id);

create index if not exists follows_following_id_idx
  on public.follows (following_id);

create index if not exists follows_following_created_at_idx
  on public.follows (following_id, created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_tweets_updated_at on public.tweets;
create trigger set_tweets_updated_at
before update on public.tweets
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  safe_username text;
begin
  base_username := regexp_replace(coalesce(split_part(new.email, '@', 1), 'user'), '[^A-Za-z0-9_]', '', 'g');
  if base_username = '' then
    base_username := 'user';
  end if;

  safe_username := lower(left(base_username, 15) || '_' || right(new.id::text, 4));

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    safe_username,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), base_username),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tweets enable row level security;
alter table public.follows enable row level security;

drop policy if exists "profiles_are_public_readable" on public.profiles;
create policy "profiles_are_public_readable"
on public.profiles
for select
using (true);

drop policy if exists "users_can_insert_own_profile" on public.profiles;
create policy "users_can_insert_own_profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "users_can_update_own_profile" on public.profiles;
create policy "users_can_update_own_profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "tweets_are_public_readable" on public.tweets;
create policy "tweets_are_public_readable"
on public.tweets
for select
using (true);

drop policy if exists "users_can_insert_own_tweets" on public.tweets;
create policy "users_can_insert_own_tweets"
on public.tweets
for insert
with check (auth.uid() = author_id);

drop policy if exists "users_can_update_own_tweets" on public.tweets;
create policy "users_can_update_own_tweets"
on public.tweets
for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "users_can_delete_own_tweets" on public.tweets;
create policy "users_can_delete_own_tweets"
on public.tweets
for delete
using (auth.uid() = author_id);

drop policy if exists "follows_are_public_readable" on public.follows;
create policy "follows_are_public_readable"
on public.follows
for select
using (true);

drop policy if exists "users_can_follow_as_themselves" on public.follows;
create policy "users_can_follow_as_themselves"
on public.follows
for insert
with check (auth.uid() = follower_id);

drop policy if exists "users_can_unfollow_as_themselves" on public.follows;
create policy "users_can_unfollow_as_themselves"
on public.follows
for delete
using (auth.uid() = follower_id);
