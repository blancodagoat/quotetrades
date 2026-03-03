-- Lead-to-Quote Trades Schema
-- Run this in the Supabase SQL Editor.
-- gen_random_uuid() is built into PostgreSQL 13+ (Supabase); no extensions needed.

-- ─── Business profile (one per user) ──────────────────────────────────────────
create table if not exists public.business_profiles (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null unique references auth.users(id) on delete cascade,
  company_name text       not null default '',
  email       text,
  phone       text,
  address     text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── Leads ────────────────────────────────────────────────────────────────────
create type lead_status as enum ('new', 'quoted', 'accepted', 'declined', 'done');
create type lead_source as enum ('call', 'web', 'referral', 'other');

create table if not exists public.leads (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  name         text        not null,
  phone        text,
  email        text,
  address      text,
  job_type     text,
  notes        text,
  source       lead_source not null default 'call',
  status       lead_status not null default 'new',
  scheduled_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index idx_leads_user_id on public.leads(user_id);
create index idx_leads_status  on public.leads(status);

-- ─── Quote templates ──────────────────────────────────────────────────────────
create table if not exists public.quote_templates (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text        not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_quote_templates_user_id on public.quote_templates(user_id);

create table if not exists public.quote_template_items (
  id           uuid           primary key default gen_random_uuid(),
  template_id  uuid           not null references public.quote_templates(id) on delete cascade,
  description  text           not null,
  quantity     decimal(10,2)  not null default 1,
  unit_price_cents bigint     not null default 0,
  sort_order   int            not null default 0
);

create index idx_qti_template_id on public.quote_template_items(template_id);

-- ─── Quotes ───────────────────────────────────────────────────────────────────
create type quote_status as enum ('draft', 'sent', 'accepted', 'declined');

create table if not exists public.quotes (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  lead_id     uuid        not null references public.leads(id) on delete restrict,
  title       text        not null,
  status      quote_status not null default 'draft',
  total_cents bigint      not null default 0,
  valid_until date,
  notes       text,
  public_slug text        unique,
  -- Snapshots captured at send time so the public quote page needs no extra tables.
  client_name    text,
  client_phone   text,
  client_email   text,
  client_address text,
  biz_name       text,
  biz_phone      text,
  biz_email      text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index idx_quotes_user_id    on public.quotes(user_id);
create index idx_quotes_lead_id    on public.quotes(lead_id);
create index idx_quotes_public_slug on public.quotes(public_slug);

create table if not exists public.quote_items (
  id               uuid          primary key default gen_random_uuid(),
  quote_id         uuid          not null references public.quotes(id) on delete cascade,
  description      text          not null,
  quantity         decimal(10,2) not null default 1,
  unit_price_cents bigint        not null,
  sort_order       int           not null default 0,
  created_at       timestamptz   default now()
);

create index idx_quote_items_quote_id on public.quote_items(quote_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.business_profiles   enable row level security;
alter table public.leads               enable row level security;
alter table public.quote_templates     enable row level security;
alter table public.quote_template_items enable row level security;
alter table public.quotes              enable row level security;
alter table public.quote_items         enable row level security;

-- Business profiles: owner only
create policy "bp_all_own" on public.business_profiles
  for all using (auth.uid() = user_id);

-- Leads: owner only
create policy "leads_all_own" on public.leads
  for all using (auth.uid() = user_id);

-- Quote templates: owner only
create policy "templates_all_own" on public.quote_templates
  for all using (auth.uid() = user_id);

create policy "template_items_all_via_template" on public.quote_template_items
  for all using (
    exists (select 1 from public.quote_templates t
            where t.id = template_id and t.user_id = auth.uid())
  );

-- Quotes: owner full access
create policy "quotes_all_own" on public.quotes
  for all using (auth.uid() = user_id);

-- Public quote view by slug (unauthenticated shareable link) — anon only
create policy "quotes_public_read_by_slug" on public.quotes
  for select to anon
  using (public_slug is not null);

-- Client accept action via slug — anon only
create policy "quotes_public_accept_by_slug" on public.quotes
  for update to anon
  using (public_slug is not null)
  with check (public_slug is not null);

-- Quote items: owner via quote
create policy "quote_items_all_via_quote" on public.quote_items
  for all using (
    exists (select 1 from public.quotes q
            where q.id = quote_id and q.user_id = auth.uid())
  );

-- Quote items: anon can read items for public (slug-bearing) quotes
create policy "quote_items_public_read" on public.quote_items
  for select to anon
  using (
    exists (select 1 from public.quotes q
            where q.id = quote_id and q.public_slug is not null)
  );
