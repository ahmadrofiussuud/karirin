-- Each signed-in user owns one workspace, including their profile and journeys.
-- No service-role key is needed by the browser application.
create table if not exists public.workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint workspace_data_object check (jsonb_typeof(data) = 'object'),
  constraint workspace_version check (data ->> 'version' = '1'),
  constraint workspace_size check (octet_length(data::text) <= 262144)
);

alter table public.workspaces enable row level security;

revoke all on public.workspaces from anon;
grant select, insert, update on public.workspaces to authenticated;

create policy "Read own workspace" on public.workspaces
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own workspace" on public.workspaces
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own workspace" on public.workspaces
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create function public.advance_workspace_revision()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := now();
  return new;
end;
$$;

create trigger workspace_revision before update on public.workspaces
for each row execute function public.advance_workspace_revision();
