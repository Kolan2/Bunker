-- Начальная схема сетевого режима. Выполнять в Supabase SQL Editor.
-- Клиентам запрещено напрямую читать приватные карты других игроков.
create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  setting text not null check (setting in ('modern','fantasy')),
  host_token_hash text not null,
  status text not null default 'lobby' check (status in ('lobby','dealt','finished')),
  player_limit int not null default 5 check (player_limit between 3 and 5),
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  display_name text not null,
  seat int not null,
  token_hash text not null,
  joined_at timestamptz not null default now(),
  unique(room_id, seat),
  unique(room_id, display_name)
);

create table if not exists public.card_instances (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  card_id text not null,
  category text not null,
  copy_no int not null,
  revealed boolean not null default false,
  unique(room_id, card_id, copy_no)
);

alter table public.rooms enable row level security;
alter table public.players enable row level security;
alter table public.card_instances enable row level security;

-- Включаем доступ к данным только через проверенные Edge Functions.
-- Не добавляйте anon/authenticated policies для приватных карт до реализации
-- проверки токена участника и фильтрации по player_id.
revoke all on public.rooms from anon, authenticated;
revoke all on public.players from anon, authenticated;
revoke all on public.card_instances from anon, authenticated;

-- Следующий этап: Edge Functions create-room, join-room, deal-cards,
-- get-my-hand, reveal-card, play-special-card. Раздача должна выполняться
-- одной транзакцией, блокировать пул комнаты и проверять остатки copies.