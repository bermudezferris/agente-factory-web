create extension if not exists btree_gist;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  conversation_id uuid not null references public.conversations(id),
  contact_id uuid not null references public.contacts(id),
  calendar_id text not null,
  calendar_event_id text unique,
  source_interaction_id text not null unique,
  status text not null default 'HOLD'
    check (status in ('HOLD', 'BOOKED', 'CANCELLED', 'FAILED')),
  appointment_type text not null default 'Diagnóstico Estratégico de IA',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  blocked_until timestamptz not null,
  timezone text not null,
  attendee_name text not null,
  attendee_email text not null,
  company text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_valid_range check (ends_at > starts_at),
  constraint appointments_valid_buffer check (blocked_until >= ends_at),
  constraint appointments_calendar_slot_exclusion exclude using gist (
    calendar_id with =,
    tstzrange(starts_at, blocked_until, '[)') with &&
  ) where (status in ('HOLD', 'BOOKED'))
);

create index if not exists appointments_contact_status_idx
  on public.appointments (contact_id, status, starts_at);

create index if not exists appointments_conversation_idx
  on public.appointments (conversation_id, created_at desc);

alter table public.appointments enable row level security;

grant select, insert, update on public.appointments to service_role;
