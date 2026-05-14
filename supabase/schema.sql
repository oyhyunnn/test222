-- AI Meeting Notes - Supabase Schema
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 복사/붙여넣기 후 Run 을 누르세요.

-- UUID 생성을 위한 확장
create extension if not exists "pgcrypto";

-- 1) meetings: 회의 메인 정보
create table if not exists public.meetings (
  id           uuid primary key default gen_random_uuid(),
  title        text not null default '제목 없는 회의',
  raw_content  text not null,
  summary      text,
  agenda       jsonb not null default '[]'::jsonb,
  decisions    jsonb not null default '[]'::jsonb,
  participants jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now()
);

-- 2) action_items: 후속 과제 상세
create table if not exists public.action_items (
  id         uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  assignee   text not null default '미정',
  task       text not null,
  due_date   text not null default '미정'
);

create index if not exists action_items_meeting_id_idx
  on public.action_items(meeting_id);

create index if not exists meetings_created_at_idx
  on public.meetings(created_at desc);

-- 3) RLS (Row Level Security)
-- 이 데모는 별도 로그인 없이 사용하므로, 익명(anon) 사용자도 읽기/쓰기 가능하도록 설정합니다.
-- 추후 Auth 를 붙이면 정책을 user_id 기준으로 바꿔주세요.
alter table public.meetings enable row level security;
alter table public.action_items enable row level security;

drop policy if exists "meetings_all_access" on public.meetings;
create policy "meetings_all_access"
  on public.meetings for all
  using (true)
  with check (true);

drop policy if exists "action_items_all_access" on public.action_items;
create policy "action_items_all_access"
  on public.action_items for all
  using (true)
  with check (true);
