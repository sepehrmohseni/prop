-- Prop Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Profiles table (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- User Preferences
create table public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  base_currency text not null default 'USD',
  locale text,
  default_country text,
  theme text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users can view own preferences" on public.user_preferences
  for select using (auth.uid() = user_id);

create policy "Users can insert own preferences" on public.user_preferences
  for insert with check (auth.uid() = user_id);

create policy "Users can update own preferences" on public.user_preferences
  for update using (auth.uid() = user_id);

-- Assets
create table public.assets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  name text not null,
  description text,
  status text not null default 'active',
  currency text not null default 'USD',
  current_value numeric not null default 0,
  cost_basis numeric,
  base_currency_value numeric,
  conversion_rate numeric,
  ownership_percentage numeric not null default 100,
  quantity numeric,
  acquisition_date date,
  country text,
  region text,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}',
  notes text,
  last_valuation_date timestamptz,
  valuation_source text not null default 'manual',
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assets enable row level security;

create policy "Users can view own assets" on public.assets
  for select using (auth.uid() = user_id);

create policy "Users can insert own assets" on public.assets
  for insert with check (auth.uid() = user_id);

create policy "Users can update own assets" on public.assets
  for update using (auth.uid() = user_id);

create policy "Users can delete own assets" on public.assets
  for delete using (auth.uid() = user_id);

create index idx_assets_user_id on public.assets(user_id);
create index idx_assets_category on public.assets(category);
create index idx_assets_status on public.assets(status);
create index idx_assets_is_deleted on public.assets(is_deleted);
create index idx_assets_updated_at on public.assets(updated_at desc);

-- Asset Valuations (history)
create table public.asset_valuations (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value_amount numeric not null,
  currency text not null,
  conversion_rate numeric,
  base_currency_value numeric,
  valuation_date timestamptz not null default now(),
  source_type text not null default 'manual',
  source_name text,
  confidence text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.asset_valuations enable row level security;

create policy "Users can view own valuations" on public.asset_valuations
  for select using (auth.uid() = user_id);

create policy "Users can insert own valuations" on public.asset_valuations
  for insert with check (auth.uid() = user_id);

create index idx_valuations_asset_id on public.asset_valuations(asset_id);
create index idx_valuations_date on public.asset_valuations(valuation_date desc);

-- Asset Tags
create table public.asset_tags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

alter table public.asset_tags enable row level security;

create policy "Users can view own tags" on public.asset_tags
  for select using (auth.uid() = user_id);

create policy "Users can insert own tags" on public.asset_tags
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own tags" on public.asset_tags
  for delete using (auth.uid() = user_id);

-- Asset Purchase Lots (multiple acquisition sources per asset)
create table public.asset_purchases (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_name text not null,
  quantity numeric,
  unit_cost numeric,
  total_cost numeric not null default 0,
  currency text not null default 'USD',
  acquisition_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.asset_purchases enable row level security;

create policy "Users can view own purchases" on public.asset_purchases
  for select using (auth.uid() = user_id);

create policy "Users can insert own purchases" on public.asset_purchases
  for insert with check (auth.uid() = user_id);

create policy "Users can update own purchases" on public.asset_purchases
  for update using (auth.uid() = user_id);

create policy "Users can delete own purchases" on public.asset_purchases
  for delete using (auth.uid() = user_id);

create index idx_purchases_asset_id on public.asset_purchases(asset_id);
create index idx_purchases_user_id on public.asset_purchases(user_id);

-- AI Usage Logs
create table public.ai_usage_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  model text not null,
  created_at timestamptz not null default now()
);

alter table public.ai_usage_logs enable row level security;

create policy "Users can view own ai logs" on public.ai_usage_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert own ai logs" on public.ai_usage_logs
  for insert with check (auth.uid() = user_id);

-- Future-ready: Price Sources (for phase 2)
create table public.price_sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  provider_type text not null,
  asset_categories text[] not null default '{}',
  countries text[] not null default '{}',
  is_active boolean not null default true,
  config jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Future-ready: Price Snapshots (for phase 2)
create table public.price_snapshots (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  source_id uuid references public.price_sources(id),
  price numeric not null,
  currency text not null,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Future-ready: FX Rates (for phase 2)
create table public.fx_rates (
  id uuid primary key default uuid_generate_v4(),
  from_currency text not null,
  to_currency text not null,
  rate numeric not null,
  source text not null default 'manual',
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_fx_rates_pair on public.fx_rates(from_currency, to_currency);
create index idx_fx_rates_fetched on public.fx_rates(fetched_at desc);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  insert into public.user_preferences (user_id)
  values (new.id);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
