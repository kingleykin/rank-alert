-- RankAlert Supabase Schema
-- Run this in Supabase SQL Editor

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Create user_subscriptions table (optional - nếu muốn lưu subscriptions ở Supabase thay vì D1)
create table if not exists public.user_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  ranking_id text not null,
  onesignal_player_id text,
  notify_on_change boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, ranking_id)
);

-- Enable RLS for subscriptions
alter table public.user_subscriptions enable row level security;

-- Policies for subscriptions
create policy "Users can view their own subscriptions"
  on user_subscriptions for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own subscriptions"
  on user_subscriptions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own subscriptions"
  on user_subscriptions for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own subscriptions"
  on user_subscriptions for delete
  using ( auth.uid() = user_id );

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for profiles updated_at
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Trigger for subscriptions updated_at
create trigger on_subscriptions_updated
  before update on public.user_subscriptions
  for each row execute procedure public.handle_updated_at();

-- Indexes for better performance
create index if not exists idx_user_subscriptions_user_id on public.user_subscriptions(user_id);
create index if not exists idx_user_subscriptions_ranking_id on public.user_subscriptions(ranking_id);
create index if not exists idx_user_subscriptions_player_id on public.user_subscriptions(onesignal_player_id);
