create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followed_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  constraint follows_no_self_follow check (follower_id <> followed_id)
);

create table if not exists public.tweets (
  id bigint generated always as identity primary key,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content varchar(255) not null,
  reply_to_tweet_id bigint references public.tweets (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint tweets_content_length check (char_length(trim(content)) between 1 and 255)
);

create index if not exists idx_tweets_author_created_at
  on public.tweets (author_id, created_at desc);

create index if not exists idx_tweets_reply_to_tweet_id
  on public.tweets (reply_to_tweet_id);

create index if not exists idx_follows_follower_id
  on public.follows (follower_id);

create index if not exists idx_follows_followed_id
  on public.follows (followed_id);

create or replace view public.following_feed as
select
  f.follower_id,
  t.id as tweet_id,
  t.author_id,
  t.content,
  t.reply_to_tweet_id,
  t.created_at
from public.follows f
join public.tweets t
  on t.author_id = f.followed_id;

alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.tweets enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles
  for select
  using (true);

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Authenticated users can read follows"
  on public.follows
  for select
  to authenticated
  using (true);

create policy "Users can create own follows"
  on public.follows
  for insert
  to authenticated
  with check (auth.uid() = follower_id);

create policy "Users can delete own follows"
  on public.follows
  for delete
  to authenticated
  using (auth.uid() = follower_id);

create policy "Tweets are publicly readable"
  on public.tweets
  for select
  using (true);

create policy "Users can create own tweets"
  on public.tweets
  for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can delete own tweets"
  on public.tweets
  for delete
  to authenticated
  using (auth.uid() = author_id);
