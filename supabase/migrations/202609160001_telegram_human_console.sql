create table if not exists public.telegram_operator_assignments (
  id uuid primary key default gen_random_uuid(),
  operator_chat_id text not null,
  conversation_id uuid not null references public.conversations(id),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'RELEASED')),
  assigned_at timestamptz not null default now(),
  released_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists telegram_assignments_one_active_per_operator
  on public.telegram_operator_assignments (operator_chat_id)
  where status = 'ACTIVE';

create unique index if not exists telegram_assignments_one_active_per_conversation
  on public.telegram_operator_assignments (conversation_id)
  where status = 'ACTIVE';

create index if not exists telegram_assignments_conversation_idx
  on public.telegram_operator_assignments (conversation_id, assigned_at desc);

create table if not exists public.telegram_webhook_updates (
  dedupe_key text primary key,
  update_id bigint,
  update_type text not null,
  processed_at timestamptz not null default now()
);

create table if not exists public.telegram_notifications (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  conversation_id uuid not null references public.conversations(id),
  notification_type text not null,
  telegram_message_id bigint,
  status text not null default 'PENDING' check (status in ('PENDING', 'SENT', 'FAILED')),
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists telegram_notifications_conversation_idx
  on public.telegram_notifications (conversation_id, created_at desc);

alter table public.telegram_operator_assignments enable row level security;
alter table public.telegram_webhook_updates enable row level security;
alter table public.telegram_notifications enable row level security;

grant select, insert, update on public.telegram_operator_assignments to service_role;
grant select, insert on public.telegram_webhook_updates to service_role;
grant select, insert, update on public.telegram_notifications to service_role;

create or replace function public.take_telegram_conversation(
  p_operator_chat_id text,
  p_conversation_id uuid
)
returns table (result text, active_conversation_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_active_conversation_id uuid;
  v_organization_id uuid;
  v_status public.conversation_status;
begin
  select assignment.conversation_id
    into v_active_conversation_id
    from public.telegram_operator_assignments as assignment
   where assignment.operator_chat_id = p_operator_chat_id
     and assignment.status = 'ACTIVE'
   limit 1;

  if v_active_conversation_id is not null then
    return query select
      case when v_active_conversation_id = p_conversation_id then 'ALREADY_TAKEN' else 'OPERATOR_BUSY' end,
      v_active_conversation_id;
    return;
  end if;

  select conversation.organization_id, conversation.status
    into v_organization_id, v_status
    from public.conversations as conversation
   where conversation.id = p_conversation_id
   for update;

  if v_organization_id is null or v_status <> 'HUMAN_REQUIRED' then
    return query select 'NOT_AVAILABLE'::text, null::uuid;
    return;
  end if;

  begin
    insert into public.telegram_operator_assignments (operator_chat_id, conversation_id)
    values (p_operator_chat_id, p_conversation_id);
  exception when unique_violation then
    return query select 'NOT_AVAILABLE'::text, null::uuid;
    return;
  end;

  update public.conversations
     set status = 'HUMAN_ACTIVE'
   where id = p_conversation_id;

  insert into public.conversation_events (
    organization_id, conversation_id, event_type, from_status, to_status, actor_type, metadata
  ) values (
    v_organization_id, p_conversation_id, 'HUMAN_TAKEOVER', 'HUMAN_REQUIRED', 'HUMAN_ACTIVE', 'HUMAN',
    jsonb_build_object('operator_chat_id', p_operator_chat_id)
  );

  return query select 'TAKEN'::text, p_conversation_id;
end;
$$;

create or replace function public.release_telegram_conversation(
  p_operator_chat_id text
)
returns table (result text, released_conversation_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment_id uuid;
  v_conversation_id uuid;
  v_organization_id uuid;
  v_status public.conversation_status;
begin
  select assignment.id, assignment.conversation_id
    into v_assignment_id, v_conversation_id
    from public.telegram_operator_assignments as assignment
   where assignment.operator_chat_id = p_operator_chat_id
     and assignment.status = 'ACTIVE'
   for update
   limit 1;

  if v_assignment_id is null then
    return query select 'NO_ACTIVE'::text, null::uuid;
    return;
  end if;

  select conversation.organization_id, conversation.status
    into v_organization_id, v_status
    from public.conversations as conversation
   where conversation.id = v_conversation_id
   for update;

  update public.telegram_operator_assignments
     set status = 'RELEASED', released_at = now()
   where id = v_assignment_id;

  if v_status = 'HUMAN_ACTIVE' then
    update public.conversations set status = 'AI_ACTIVE' where id = v_conversation_id;

    insert into public.conversation_events (
      organization_id, conversation_id, event_type, from_status, to_status, actor_type, metadata
    ) values
      (v_organization_id, v_conversation_id, 'HUMAN_RELEASE', 'HUMAN_ACTIVE', 'AI_ACTIVE', 'HUMAN', jsonb_build_object('operator_chat_id', p_operator_chat_id)),
      (v_organization_id, v_conversation_id, 'AI_RESUMED', 'HUMAN_ACTIVE', 'AI_ACTIVE', 'SYSTEM', '{}'::jsonb);
  end if;

  return query select 'RELEASED'::text, v_conversation_id;
end;
$$;

revoke all on function public.take_telegram_conversation(text, uuid) from public;
revoke all on function public.release_telegram_conversation(text) from public;
grant execute on function public.take_telegram_conversation(text, uuid) to service_role;
grant execute on function public.release_telegram_conversation(text) to service_role;
