-- ============================================================
-- PianoFinanziario — Schema Supabase
-- Esegui questo SQL nell'editor SQL del tuo progetto Supabase
-- ============================================================

-- Tabella profili utente
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email text not null,

  -- Profilo assegnato
  profile text not null check (profile in ('essenziale', 'prudente', 'bilanciato', 'crescita')),

  -- Parametri finanziari
  initial_capital numeric(12, 2) default 0,
  monthly_payment numeric(10, 2) default 0,
  horizon_years integer default 15,
  annual_return numeric(5, 2) default 6.5,
  annual_payment_growth numeric(5, 2) default 3,

  -- Dati onboarding
  goal text,
  experience text,
  risk_tolerance text,

  -- Metadati
  onboarding_completed boolean default false,
  created_at timestamp with time zone default now(),
  last_rebalance_at timestamp with time zone
);

-- Abilita RLS (Row Level Security)
alter table public.user_profiles enable row level security;

-- Policy: ogni utente vede solo il proprio profilo
create policy "Users can view own profile"
  on public.user_profiles
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.user_profiles
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.user_profiles
  for update
  using (auth.uid() = user_id);

-- Index per performance
create index if not exists user_profiles_user_id_idx on public.user_profiles(user_id);

-- ============================================================
-- NOTA: Le email automatiche (Resend) vengono inviate tramite
-- Supabase Edge Functions o da un server separato.
-- Le funzioni Edge sono nella cartella /supabase/functions/
-- ============================================================

-- Waitlist Tracker PAC
create table if not exists public.tracker_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamp with time zone default now()
);

-- Nessuna RLS necessaria: insert pubblico (anche utenti non loggati)
-- Policy: chiunque può iscriversi, nessuno può leggere la lista
alter table public.tracker_waitlist enable row level security;

create policy "Anyone can join tracker waitlist"
  on public.tracker_waitlist
  for insert
  with check (true);
