create extension if not exists pgcrypto;

create type public.conversation_status as enum (
  'AI_ACTIVE',
  'HUMAN_REQUIRED',
  'HUMAN_ACTIVE',
  'PAUSED',
  'CLOSED'
);

create type public.message_direction as enum ('INBOUND', 'OUTBOUND');
create type public.message_status as enum ('RECEIVED', 'SENT', 'DELIVERED', 'READ', 'FAILED');
create type public.message_sender_type as enum ('CONTACT', 'AI_AGENT', 'HUMAN', 'SYSTEM');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.whatsapp_channels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null,
  phone_number_id text not null unique,
  waba_id text,
  business_account_id text,
  display_phone_number text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  whatsapp_wa_id text not null,
  display_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, whatsapp_wa_id)
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  is_active boolean not null default false,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  whatsapp_channel_id uuid not null references public.whatsapp_channels(id) on delete restrict,
  contact_id uuid not null references public.contacts(id) on delete restrict,
  status public.conversation_status not null default 'AI_ACTIVE',
  assigned_agent_id uuid references public.agents(id) on delete set null,
  last_message_at timestamptz,
  closed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index conversations_one_open_per_contact_channel
  on public.conversations (whatsapp_channel_id, contact_id)
  where status <> 'CLOSED';

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  whatsapp_channel_id uuid not null references public.whatsapp_channels(id) on delete restrict,
  conversation_id uuid not null references public.conversations(id) on delete restrict,
  contact_id uuid not null references public.contacts(id) on delete restrict,
  agent_id uuid references public.agents(id) on delete set null,
  direction public.message_direction not null,
  sender_type public.message_sender_type not null,
  sender text not null,
  recipient text,
  message_type text not null,
  content text,
  whatsapp_message_id text not null,
  occurred_at timestamptz not null,
  status public.message_status not null default 'RECEIVED',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (whatsapp_channel_id, whatsapp_message_id)
);

create index messages_conversation_occurred_at_idx
  on public.messages (conversation_id, occurred_at desc);

create table public.conversation_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  event_type text not null,
  from_status public.conversation_status,
  to_status public.conversation_status,
  actor_type public.message_sender_type not null default 'SYSTEM',
  actor_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
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

create trigger organizations_set_updated_at before update on public.organizations
for each row execute function public.set_updated_at();
create trigger whatsapp_channels_set_updated_at before update on public.whatsapp_channels
for each row execute function public.set_updated_at();
create trigger contacts_set_updated_at before update on public.contacts
for each row execute function public.set_updated_at();
create trigger agents_set_updated_at before update on public.agents
for each row execute function public.set_updated_at();
create trigger conversations_set_updated_at before update on public.conversations
for each row execute function public.set_updated_at();
create trigger messages_set_updated_at before update on public.messages
for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.whatsapp_channels enable row level security;
alter table public.contacts enable row level security;
alter table public.agents enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_events enable row level security;

create or replace function public.ingest_whatsapp_text_message(
  p_phone_number_id text,
  p_whatsapp_message_id text,
  p_sender_wa_id text,
  p_sender_display_name text,
  p_recipient text,
  p_content text,
  p_occurred_at timestamptz,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  organization_id uuid,
  whatsapp_channel_id uuid,
  contact_id uuid,
  conversation_id uuid,
  message_id uuid,
  contact_created boolean,
  conversation_created boolean,
  duplicate boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_organization_id uuid;
  v_channel_id uuid;
  v_contact_id uuid;
  v_conversation_id uuid;
  v_message_id uuid;
  v_contact_created boolean := false;
  v_conversation_created boolean := false;
begin
  select wc.id, wc.organization_id
    into v_channel_id, v_organization_id
  from public.whatsapp_channels wc
  join public.organizations o on o.id = wc.organization_id
  where wc.phone_number_id = p_phone_number_id
    and wc.is_active = true
    and o.is_active = true;

  if v_channel_id is null then
    raise exception 'No active WhatsApp channel for phone_number_id %', p_phone_number_id
      using errcode = 'P0002';
  end if;

  select m.id, m.contact_id, m.conversation_id
    into v_message_id, v_contact_id, v_conversation_id
  from public.messages m
  where m.whatsapp_channel_id = v_channel_id
    and m.whatsapp_message_id = p_whatsapp_message_id;

  if v_message_id is not null then
    return query select
      v_organization_id, v_channel_id, v_contact_id, v_conversation_id,
      v_message_id, false, false, true;
    return;
  end if;

  select c.id into v_contact_id
  from public.contacts c
  where c.organization_id = v_organization_id
    and c.whatsapp_wa_id = p_sender_wa_id;

  if v_contact_id is null then
    insert into public.contacts (
      organization_id, whatsapp_wa_id, display_name
    ) values (
      v_organization_id, p_sender_wa_id, p_sender_display_name
    )
    on conflict (organization_id, whatsapp_wa_id) do update
      set display_name = coalesce(excluded.display_name, contacts.display_name)
    returning id into v_contact_id;
    v_contact_created := true;
  elsif p_sender_display_name is not null then
    update public.contacts
      set display_name = p_sender_display_name
    where id = v_contact_id and display_name is distinct from p_sender_display_name;
  end if;

  select c.id into v_conversation_id
  from public.conversations c
  where c.whatsapp_channel_id = v_channel_id
    and c.contact_id = v_contact_id
    and c.status <> 'CLOSED'
  limit 1;

  if v_conversation_id is null then
    insert into public.conversations (
      organization_id, whatsapp_channel_id, contact_id, status, last_message_at
    ) values (
      v_organization_id, v_channel_id, v_contact_id, 'AI_ACTIVE', p_occurred_at
    )
    on conflict (whatsapp_channel_id, contact_id) where status <> 'CLOSED'
    do update set last_message_at = greatest(
      coalesce(conversations.last_message_at, excluded.last_message_at),
      excluded.last_message_at
    )
    returning id into v_conversation_id;
    v_conversation_created := true;
  end if;

  insert into public.messages (
    organization_id,
    whatsapp_channel_id,
    conversation_id,
    contact_id,
    direction,
    sender_type,
    sender,
    recipient,
    message_type,
    content,
    whatsapp_message_id,
    occurred_at,
    status,
    metadata
  ) values (
    v_organization_id,
    v_channel_id,
    v_conversation_id,
    v_contact_id,
    'INBOUND',
    'CONTACT',
    p_sender_wa_id,
    p_recipient,
    'text',
    p_content,
    p_whatsapp_message_id,
    p_occurred_at,
    'RECEIVED',
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (whatsapp_channel_id, whatsapp_message_id) do nothing
  returning id into v_message_id;

  if v_message_id is null then
    select m.id, m.contact_id, m.conversation_id
      into v_message_id, v_contact_id, v_conversation_id
    from public.messages m
    where m.whatsapp_channel_id = v_channel_id
      and m.whatsapp_message_id = p_whatsapp_message_id;

    return query select
      v_organization_id, v_channel_id, v_contact_id, v_conversation_id,
      v_message_id, false, false, true;
    return;
  end if;

  update public.conversations
    set last_message_at = greatest(coalesce(last_message_at, p_occurred_at), p_occurred_at)
  where id = v_conversation_id;

  return query select
    v_organization_id, v_channel_id, v_contact_id, v_conversation_id,
    v_message_id, v_contact_created, v_conversation_created, false;
end;
$$;

revoke all on function public.ingest_whatsapp_text_message(
  text, text, text, text, text, text, timestamptz, jsonb
) from public;
grant execute on function public.ingest_whatsapp_text_message(
  text, text, text, text, text, text, timestamptz, jsonb
) to service_role;

comment on function public.ingest_whatsapp_text_message is
  'Atomically resolves channel/contact/conversation and idempotently stores an inbound WhatsApp text message.';
