# X Clone Workspace

Monorepo con:

- `app`: React + Vite + Tailwind
- `api`: Express + TypeScript

## Requisitos

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
```

## Scripts raíz

- `npm run dev`: levanta frontend y backend.
- `npm run test`: ejecuta tests de `app` y `api`.
- `npm run lint`: ejecuta lint de `app` y `api`.
- `npm run supabase:gen`: genera tipos de Supabase en `app/src/lib/database.types.ts`.
