# AgenteFactory

Sitio web y backend inicial de la plataforma multiempresa de agentes conectados a WhatsApp. La Fase 1 recibe mensajes de texto mediante la API oficial de Meta, identifica el canal/contacto/conversación y los persiste de forma idempotente en Supabase. No envía respuestas ni ejecuta IA.

## Arquitectura de Fase 1

```text
Meta WhatsApp Cloud API
  -> POST /api/webhooks/whatsapp
  -> validación X-Hub-Signature-256
  -> MetaWhatsAppAdapter (parser)
  -> InboundMessageService (caso de uso)
  -> ConversationRepository
  -> función transaccional de PostgreSQL/Supabase
```

El `Phone Number ID` recibido determina `whatsapp_channels`; el canal determina la organización. Los contactos son únicos por organización, por lo que una persona puede conversar por varios canales sin duplicar su identidad. Un canal puede alimentar después a un orquestador y a varios agentes sin cambiar la ingestión.

## Requisitos

- Node.js 20.x
- pnpm 11.x
- Proyecto de Supabase
- Meta Business Portfolio, WABA, App y número habilitado para WhatsApp Cloud API
- Una URL pública HTTPS para que Meta alcance el webhook

## Instalación y variables

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Completa `.env.local`:

| Variable | Uso |
| --- | --- |
| `SUPABASE_URL` | URL del proyecto Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Credencial exclusiva del servidor; nunca lleva prefijo `NEXT_PUBLIC_`. |
| `META_WEBHOOK_VERIFY_TOKEN` | Cadena aleatoria elegida por nosotros y copiada en Meta al verificar. |
| `META_APP_SECRET` | Secreto de la App de Meta para validar `X-Hub-Signature-256`. |
| `META_ACCESS_TOKEN` | Token server-side del System User para enviar mensajes por Cloud API. |
| `OPENAI_API_KEY` | Habilita respuestas automáticas mediante Responses API. Sin ella solo se ingiere. |
| `OPENAI_MODEL` | Modelo de texto; por defecto `gpt-5-mini`. |
| `ADMIN_API_KEY` | Bearer token para proteger los endpoints internos. |

Todos son obligatorios para el webhook. `/health` funciona sin ellos. `.env*` está ignorado y `.env.example` sí se versiona.

## Supabase y migraciones

La migración versionada está en `supabase/migrations/202609130001_phase1_whatsapp_ingestion.sql`. Con Supabase CLI instalado y autenticado:

```bash
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

Para desarrollo local con Supabase CLI también se puede usar `supabase start` y `supabase db reset`. La migración crea RLS sin políticas públicas; el backend accede exclusivamente con `service_role`.

Después de aplicar la migración, crea la organización y el canal una sola vez en SQL Editor. Sustituye todos los marcadores por datos confirmados en Meta:

```sql
with organization as (
  insert into public.organizations (name, slug)
  values ('AgenteFactory', 'agentefactory')
  on conflict (slug) do update set name = excluded.name
  returning id
)
insert into public.whatsapp_channels (
  organization_id, name, phone_number_id, waba_id,
  business_account_id, display_phone_number
)
select
  id, 'WhatsApp principal', 'PHONE_NUMBER_ID_DE_META',
  'WABA_ID_DE_META', 'BUSINESS_ACCOUNT_ID_DE_META', 'NUMERO_VISIBLE'
from organization
on conflict (phone_number_id) do update set
  organization_id = excluded.organization_id,
  name = excluded.name,
  waba_id = excluded.waba_id,
  business_account_id = excluded.business_account_id,
  display_phone_number = excluded.display_phone_number,
  is_active = true;
```

No se guardan tokens ni App Secret en las tablas. La función `ingest_whatsapp_text_message` ejecuta la identificación y persistencia en una transacción. El constraint único `(whatsapp_channel_id, whatsapp_message_id)` es la garantía de idempotencia incluso con entregas concurrentes.

## Desarrollo local

```bash
pnpm dev
curl -i http://localhost:3000/health
```

Respuesta esperada: `{"status":"ok"}`.

Para exponer temporalmente el servidor se puede usar cualquiera de estas opciones, sin dependencia permanente del proyecto:

```bash
ngrok http 3000
# o
cloudflared tunnel --url http://localhost:3000
```

Conserva la URL HTTPS asignada, por ejemplo `https://ejemplo.ngrok-free.app`. El callback será `https://ejemplo.ngrok-free.app/api/webhooks/whatsapp`. Las URLs temporales suelen cambiar al reiniciar en planes gratuitos.

## Configuración exacta del webhook en Meta

Antes de cambiar nada, completa la auditoría en [docs/MIGRACION_FARO_A_AGENTEFACTORY.md](docs/MIGRACION_FARO_A_AGENTEFACTORY.md) y registra el callback anterior para rollback.

1. En **Meta for Developers → Mis apps**, abre la App propietaria del número.
2. En el producto **WhatsApp → Configuration**, ubica **Webhook** y pulsa **Edit**.
3. En **Callback URL**, pega `https://TU_DOMINIO/api/webhooks/whatsapp`.
4. En **Verify token**, pega exactamente `META_WEBHOOK_VERIFY_TOKEN`; este valor no es el access token.
5. Guarda. Meta hará un `GET`; el endpoint devolverá `hub.challenge` solo si modo y token coinciden.
6. En **Webhook fields**, suscribe `messages` para la WABA correcta.
7. Verifica que el despliegue tenga `META_APP_SECRET`; cada `POST` se rechaza si `X-Hub-Signature-256` no coincide con el cuerpo crudo.
8. No reemplaces ni desactives todavía activos de Faro hasta completar la prueba real y el plan de rollback.

## Prueba con un mensaje real

1. Confirma que `whatsapp_channels.phone_number_id` coincide exactamente con el Phone Number ID mostrado por Meta.
2. Mantén el servidor público en ejecución y observa logs JSON sin compartir datos sensibles.
3. Desde otro teléfono, envía un mensaje de texto al número empresarial.
4. Confirma HTTP `200` y eventos `payload_identified`, `channel_identified`, `contact_created|found`, `conversation_created|found` y `message_persisted`.
5. En Supabase SQL Editor ejecuta:

```sql
select
  m.occurred_at,
  o.name as organization,
  wc.name as channel,
  c.whatsapp_wa_id,
  c.display_name,
  cv.status as conversation_status,
  m.direction,
  m.message_type,
  m.content,
  m.whatsapp_message_id,
  m.status
from public.messages m
join public.organizations o on o.id = m.organization_id
join public.whatsapp_channels wc on wc.id = m.whatsapp_channel_id
join public.contacts c on c.id = m.contact_id
join public.conversations cv on cv.id = m.conversation_id
order by m.created_at desc
limit 20;
```

6. Usa el reintento de Meta o reenvía el mismo payload firmado. La fila con el mismo `whatsapp_message_id` debe seguir apareciendo una sola vez y el log debe mostrar `duplicate_ignored`.

Los payloads válidos pero no soportados (estados, media u otros objetos) se responden con `200` y se ignoran. JSON inválido devuelve `400`, firma inválida `401`, configuración/DB fallida `500`; Meta puede así reintentar fallos transitorios de persistencia.

## Calidad y despliegue

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Para Hostinger usa **Node.js Web App**, Node 20.x, instalación `pnpm install --frozen-lockfile`, compilación `pnpm build` e inicio `pnpm start`. El script de build conserva `next build --webpack`, ya validado previamente en este proyecto.

## Endpoints internos de conversaciones

Todos requieren `Authorization: Bearer $ADMIN_API_KEY`:

- `GET /api/admin/conversations`: lista conversaciones.
- `GET /api/admin/conversations/{id}`: muestra contexto e historial.
- `POST /api/admin/conversations/{id}/take`: cambia a `HUMAN_ACTIVE`.
- `POST /api/admin/conversations/{id}/request-human`: cambia a `HUMAN_REQUIRED`.
- `POST /api/admin/conversations/{id}/resume-ai`: devuelve a `AI_ACTIVE`.
- `POST /api/admin/conversations/{id}/messages`: envía `{"content":"..."}` manualmente; exige además un header `Idempotency-Key` y estado `HUMAN_ACTIVE`.

Las respuestas automáticas solo se ejecutan en `AI_ACTIVE`. Antes de generar y antes de enviar se vuelve a consultar el estado. Cada intento reserva primero una fila outbound con una clave derivada del mensaje inbound; los reintentos del webhook no pueden enviar dos respuestas para el mismo mensaje. Tras el envío se reemplaza la referencia provisional por el `whatsapp_message_id` real devuelto por Meta.

## Alcance deliberadamente pendiente

Siguen pendientes RAG, media/audio, Calendar, Kommo, n8n, dashboard visual, autenticación de usuarios, routing avanzado, notificaciones y analytics. La Fase 2 inicial usa un solo agente general y endpoints internos protegidos en lugar de un inbox visual.
