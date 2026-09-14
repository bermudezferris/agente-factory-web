create table if not exists public.contact_memories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  contact_id uuid not null unique references public.contacts(id),
  relevant_client_data jsonb not null default '[]'::jsonb,
  needs_and_interests jsonb not null default '[]'::jsonb,
  agreements_and_commitments jsonb not null default '[]'::jsonb,
  appointments_and_pending jsonb not null default '[]'::jsonb,
  important_objections jsonb not null default '[]'::jsonb,
  human_handoff_notes jsonb not null default '[]'::jsonb,
  previous_conversations_summary text not null default '',
  source_interaction_ids text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_memories_relevant_client_data_array check (jsonb_typeof(relevant_client_data) = 'array'),
  constraint contact_memories_needs_and_interests_array check (jsonb_typeof(needs_and_interests) = 'array'),
  constraint contact_memories_agreements_and_commitments_array check (jsonb_typeof(agreements_and_commitments) = 'array'),
  constraint contact_memories_appointments_and_pending_array check (jsonb_typeof(appointments_and_pending) = 'array'),
  constraint contact_memories_important_objections_array check (jsonb_typeof(important_objections) = 'array'),
  constraint contact_memories_human_handoff_notes_array check (jsonb_typeof(human_handoff_notes) = 'array')
);

create index if not exists contact_memories_organization_id_idx
  on public.contact_memories (organization_id);

alter table public.contact_memories enable row level security;

grant select, insert, update on public.contact_memories to service_role;

create or replace function public.merge_contact_memory(
  p_contact_id uuid,
  p_source_interaction_id text,
  p_relevant_client_data jsonb,
  p_needs_and_interests jsonb,
  p_agreements_and_commitments jsonb,
  p_appointments_and_pending jsonb,
  p_important_objections jsonb,
  p_human_handoff_notes jsonb,
  p_previous_conversations_summary text
)
returns public.contact_memories
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_organization_id uuid;
  v_memory public.contact_memories;
begin
  select contacts.organization_id
    into v_organization_id
    from public.contacts
   where contacts.id = p_contact_id;

  if v_organization_id is null then
    raise exception 'Contact not found: %', p_contact_id;
  end if;

  insert into public.contact_memories (organization_id, contact_id)
  values (v_organization_id, p_contact_id)
  on conflict (contact_id) do nothing;

  update public.contact_memories as memories
     set relevant_client_data = (
           select coalesce(jsonb_agg(items.item order by items.item), '[]'::jsonb)
             from (
               select distinct item
                 from jsonb_array_elements_text(
                   memories.relevant_client_data || coalesce(p_relevant_client_data, '[]'::jsonb)
                 ) as values_(item)
             ) as items
         ),
         needs_and_interests = (
           select coalesce(jsonb_agg(items.item order by items.item), '[]'::jsonb)
             from (
               select distinct item
                 from jsonb_array_elements_text(
                   memories.needs_and_interests || coalesce(p_needs_and_interests, '[]'::jsonb)
                 ) as values_(item)
             ) as items
         ),
         agreements_and_commitments = (
           select coalesce(jsonb_agg(items.item order by items.item), '[]'::jsonb)
             from (
               select distinct item
                 from jsonb_array_elements_text(
                   memories.agreements_and_commitments || coalesce(p_agreements_and_commitments, '[]'::jsonb)
                 ) as values_(item)
             ) as items
         ),
         appointments_and_pending = (
           select coalesce(jsonb_agg(items.item order by items.item), '[]'::jsonb)
             from (
               select distinct item
                 from jsonb_array_elements_text(
                   memories.appointments_and_pending || coalesce(p_appointments_and_pending, '[]'::jsonb)
                 ) as values_(item)
             ) as items
         ),
         important_objections = (
           select coalesce(jsonb_agg(items.item order by items.item), '[]'::jsonb)
             from (
               select distinct item
                 from jsonb_array_elements_text(
                   memories.important_objections || coalesce(p_important_objections, '[]'::jsonb)
                 ) as values_(item)
             ) as items
         ),
         human_handoff_notes = (
           select coalesce(jsonb_agg(items.item order by items.item), '[]'::jsonb)
             from (
               select distinct item
                 from jsonb_array_elements_text(
                   memories.human_handoff_notes || coalesce(p_human_handoff_notes, '[]'::jsonb)
                 ) as values_(item)
             ) as items
         ),
         previous_conversations_summary = case
           when nullif(btrim(p_previous_conversations_summary), '') is null
             then memories.previous_conversations_summary
           else p_previous_conversations_summary
         end,
         source_interaction_ids = array_append(memories.source_interaction_ids, p_source_interaction_id),
         updated_at = now()
   where memories.contact_id = p_contact_id
     and not (p_source_interaction_id = any(memories.source_interaction_ids))
  returning memories.* into v_memory;

  if v_memory.id is null then
    select memories.*
      into v_memory
      from public.contact_memories as memories
     where memories.contact_id = p_contact_id;
  end if;

  return v_memory;
end;
$$;

revoke all on function public.merge_contact_memory(uuid, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text)
  from public;
grant execute on function public.merge_contact_memory(uuid, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text)
  to service_role;
