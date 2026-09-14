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
#variable_conflict use_column
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
