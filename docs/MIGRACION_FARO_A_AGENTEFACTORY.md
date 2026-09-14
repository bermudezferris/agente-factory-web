# Checklist de migración: Faro Humanitario → AgenteFactory

Este documento es una auditoría controlada. No autoriza borrar activos ni revocar accesos hasta confirmar dependencias y tener una ventana de cambio.

## Hallazgos del repositorio

- No se encontraron archivos, prompts, endpoints, workflows, variables de entorno ni credenciales identificables como Faro Humanitario.
- No se encontró una integración previa con Meta Cloud API o Supabase.
- El sitio sí contiene el número comercial público `584122645002`. Se conserva como contenido del sitio; el backend no lo usa para enrutar webhooks.
- No es posible determinar desde el repositorio el Business Portfolio, WABA, App, Phone Number ID, tokens, webhook, plantillas, perfil comercial, automatizaciones, servidores o n8n que siguen activos.

## Clasificación previa al cambio

| Elemento | Estado | Acción segura |
| --- | --- | --- |
| Número telefónico actual | A. CONSERVAR | Mantener el número y comprobar propiedad/acceso antes de migrar. |
| Business Portfolio y WABA actuales | D. REQUIERE REVISIÓN | Conservar si AgenteFactory tiene control administrativo y no están compartidos indebidamente con Faro. |
| Phone Number ID y WABA ID | D. REQUIERE REVISIÓN | Reutilizar si pertenecen al WABA correcto; no crear duplicados. |
| Aplicación de Meta | D. REQUIERE REVISIÓN | Puede conservarse si propiedad, nombre, usuarios, permisos y uso son apropiados para AgenteFactory. |
| Token permanente / system user | B. MODIFICAR | Emitir o rotar para una identidad controlada por AgenteFactory y mínimo privilegio. |
| Callback URL y verify token anteriores | B. MODIFICAR | Cambiar al endpoint de esta aplicación durante la ventana de migración. |
| App Secret | D. REQUIERE REVISIÓN | Mantener si la App se conserva y no estuvo expuesto; en caso de duda, rotar coordinadamente. |
| Perfil comercial, nombre, descripción, logo, web, email y categoría | B. MODIFICAR | Sustituir toda identidad visible de Faro por AgenteFactory y solicitar aprobación del nombre si aplica. |
| Plantillas de Faro | C. DESCONECTAR | No utilizarlas. Eliminar solo tras confirmar que no hay dependencias y conservar evidencia. |
| Mensajes automáticos de WhatsApp Business App | C. DESCONECTAR | Desactivar los que mencionen o se comporten como Faro. |
| Webhooks, servidores, bases y variables de Faro | C. DESCONECTAR | Retirar suscripciones y accesos después de validar el nuevo webhook; no copiar datos. |
| Workflows n8n e integraciones antiguas | C. DESCONECTAR | Desactivar tras identificar propietarios, triggers y efectos laterales. |

## Revisión manual en Meta (sin modificar todavía)

1. En **Meta Business Suite → Configuración → Cuentas → Cuentas de WhatsApp**, localiza el número y anota WABA ID, propietarios y personas/socios con acceso. Importa para confirmar control y detectar acceso heredado.
2. En **Meta for Developers → Mis apps**, abre la App vinculada a WhatsApp y revisa propietario, roles, modo, casos de uso y App ID. El App Secret y el webhook pertenecen a esta App.
3. En **WhatsApp → API Setup / Configuración de API**, confirma el número, Phone Number ID y WhatsApp Business Account ID. No crees otro número si estos identificadores son válidos.
4. En **WhatsApp → Configuration**, registra la callback actual, campos suscritos y si el webhook anterior sigue respondiendo. Esto permite desconectarlo sin cortar servicio prematuramente.
5. En **Business Settings → Users → System Users**, revisa el usuario que emite el token y sus activos/permisos. No pegues el token en tickets, chats o capturas.
6. En **WhatsApp Manager → Account tools → Message templates**, identifica plantillas con marca o contenido de Faro.
7. En **WhatsApp Manager → Phone numbers → Profile**, revisa nombre visible, descripción, sitio, email, categoría y foto.
8. Si el número solo funciona en WhatsApp Business App, confirma en Phone numbers si Meta ofrece coexistencia para esa cuenta/región. Si no, la incorporación a Cloud API puede requerir migración/registro y afectar temporalmente la app; prográmala antes de continuar.

## Secuencia de cambio recomendada

1. Exportar un inventario sin secretos: IDs, propietarios, roles, callback, suscripciones, plantillas e integraciones.
2. Confirmar que AgenteFactory controla Business Portfolio, WABA, App y dominio HTTPS.
3. Desplegar esta Fase 1, aplicar la migración y crear organización/canal con el Phone Number ID real.
4. Probar `/health` y verificar la nueva callback con un verify token nuevo.
5. Suscribir `messages` y enviar un mensaje controlado; confirmar persistencia e idempotencia.
6. Actualizar el perfil visible a AgenteFactory y esperar cualquier aprobación de Meta.
7. Solo después de validar el flujo nuevo, desactivar callback, tokens, n8n y servidores de Faro.
8. Rotar credenciales dudosas y retirar usuarios/socios heredados. Documentar quién conserva acceso.
9. Archivar o eliminar plantillas/recursos de Faro únicamente con confirmación explícita del product owner.

## Rollback

Antes de cambiar el callback, registra su valor anterior y establece una ventana de prueba. Si el nuevo endpoint no recibe o persiste correctamente, restaura temporalmente el callback previo sin borrar activos; investiga y repite la migración. No reactives respuestas automáticas de Faro.
