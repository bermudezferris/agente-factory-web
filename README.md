# AgenteFactory

Base web inicial de AgenteFactory construida con Next.js, TypeScript y Tailwind CSS.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint 9
- pnpm

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```

## Deploy en Hostinger

Ruta recomendada: `Node.js Web App`.

Configuracion sugerida en hPanel:

- Framework: `Next.js`
- Node.js: `20.x`
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Start command: `pnpm start`

Notas:

- El script de build usa `next build --webpack`, que es la ruta estable ya validada en este proyecto.
- No hace falta export estatico para Hostinger si se despliega como app Node.js.
- Si se usa subida por ZIP, subir el proyecto sin `node_modules` ni `.next`.

## Alcance actual

Sprint 0 deja lista la base tecnica del proyecto:

- App Router configurado
- Estructura inicial en `src/`
- Metadata base de marca
- Tokens visuales iniciales
- Home provisional de arranque
- Configuracion de lint y typecheck

## Proximos sprints

- Sprint 1: sistema visual
- Sprint 2: homepage comercial completa
- Sprint 3: paginas de agentes
- Sprint 4: diagnostico, privacidad y base para agenda
