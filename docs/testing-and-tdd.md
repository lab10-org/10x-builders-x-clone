# Testing y TDD

Este proyecto usa TDD pragmático para todos los features nuevos:

1. Definir alcance y casos (feliz, borde, error).
2. Escribir tests antes del código.
3. Ejecutar tests y validar fallo (rojo).
4. Implementar mínimo para pasar (verde).
5. Refactorizar sin romper.
6. Ejecutar suite completa (`npm run test`).

## Comandos útiles

### Workspace completo

- `npm run test`: corre los tests en todos los workspaces.
- `npm run lint`: corre lint en todos los workspaces.

### Frontend (`app`)

- `npm run test -w app`: tests unitarios frontend.
- `npm run test:watch -w app`: tests en modo watch.

### Backend (`api`)

- `npm run test -w api`: tests unitarios backend.
- `npm run test:watch -w api`: tests en modo watch.

## Estructura base de pruebas

- Frontend ejemplo: `app/src/__tests__/example.spec.tsx`
- Backend ejemplo: `api/src/__tests__/example.spec.ts`

## Regla de cierre por feature

Antes de cerrar un feature:

- Debe existir evidencia de un test en rojo inicial.
- Debe pasar el conjunto de tests del scope impactado.
- Debe pasar `npm run test`.
