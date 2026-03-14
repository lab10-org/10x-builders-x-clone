# 10X Clone - Scaffolding Inicial

Monorepo base para un clon de X (Twitter) con:

- `app`: frontend en React + Vite + TypeScript
- `api`: backend en Node.js + TypeScript
- `packages/shared`: utilidades compartidas para `app` y `api`

## Requisitos

- Node.js `>=20`
- npm

## Setup

```bash
npm install
```

## Comandos principales

```bash
npm run dev
npm run test
npm run test:watch
npm run build
npm run lint
```

## Estructura

```text
.
├── app/
├── api/
├── packages/
│   └── shared/
├── package.json
└── tsconfig.base.json
```

## Tests unitarios

La convención y flujo TDD del proyecto está documentada en `TESTING.md`.
