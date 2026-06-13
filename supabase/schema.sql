create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  seed text not null,
  current_index integer not null default 0 check (current_index >= 0),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

alter table public.rooms enable row level security;
alter table public.room_members enable row level security;

drop policy if exists "room members can read rooms" on public.rooms;
create policy "room members can read rooms"
on public.rooms
for select
to authenticated
using (
  exists (
    select 1
    from public.room_members
    where room_members.room_id = rooms.id
      and room_members.user_id = auth.uid()
  )
);

drop policy if exists "room members can update rooms" on public.rooms;
create policy "room members can update rooms"
on public.rooms
for update
to authenticated
using (
  exists (
    select 1
    from public.room_members
    where room_members.room_id = rooms.id
      and room_members.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.room_members
    where room_members.room_id = rooms.id
      and room_members.user_id = auth.uid()
  )
);

drop policy if exists "users can read own memberships" on public.room_members;
create policy "users can read own memberships"
on public.room_members
for select
to authenticated
using (user_id = auth.uid());

create or replace function public.create_room(p_room_code text, p_seed text)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  new_room public.rooms;
begin
  if auth.uid() is null then
    raise exception 'ログインが必要です';
  end if;

  insert into public.rooms (room_code, seed, created_by)
  values (upper(p_room_code), p_seed, auth.uid())
  returning * into new_room;

  insert into public.room_members (room_id, user_id)
  values (new_room.id, auth.uid())
  on conflict do nothing;

  return new_room;
end;
$$;

create or replace function public.join_room(p_room_code text)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  target_room public.rooms;
begin
  if auth.uid() is null then
    raise exception 'ログインが必要です';
  end if;

  select *
  into target_room
  from public.rooms
  where room_code = upper(p_room_code);

  if target_room.id is null then
    return null;
  end if;

  insert into public.room_members (room_id, user_id)
  values (target_room.id, auth.uid())
  on conflict do nothing;

  return target_room;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select, update on public.rooms to authenticated;
grant select on public.room_members to authenticated;
grant execute on function public.create_room(text, text) to authenticated;
grant execute on function public.join_room(text) to authenticated;

alter table public.rooms replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.rooms;
exception
  when duplicate_object then null;
end;
$$;
