# Estrategia de Tests Unitarios

## Herramienta

- Runner: `Vitest` en cada workspace (`app`, `api`, `packages/shared`).
- En `app` se usa `jsdom` para pruebas de frontend.

## Convenciones

- Colocar tests junto al código (`*.test.ts`).
- Nombres de tests orientados a comportamiento.
- Estructura Given/When/Then dentro de cada caso.

## Flujo TDD acordado

1. Definir casos de uso.
2. Convertir casos de uso a casos de prueba.
3. Escribir tests primero y ejecutar para ver falla (RED).
4. Implementar el cambio mínimo (GREEN).
5. Refactorizar solo si aplica.
6. Ejecutar tests de verificación.

## Ejecución

- Toda la suite del monorepo:

```bash
npm run test
```

- Modo watch en todo el monorepo:

```bash
npm run test:watch
```

- Por workspace:

```bash
npm run test -w app
npm run test -w api
npm run test -w packages/shared
```
