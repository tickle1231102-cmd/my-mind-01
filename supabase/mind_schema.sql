-- my-mind-01 tables on shared Focal project (nnulpjepaearokjujbis)
-- Do NOT modify public.profiles / app_data / claim_profile

create table if not exists public.mind_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mind_game_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level int not null default 0,
  hp int not null default 0,
  wilted_by_negative boolean not null default false,
  chat_logs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
