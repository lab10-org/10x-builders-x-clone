---
name: defining-tdd
description: Define and enforce a practical TDD workflow for this codebase. Use when implementing features, fixing bugs, or refactoring where use cases must be explicit, tests must be written before implementation, and verification must confirm behavior.
---

# Defining TDD

## Proposito

Usa este skill para aplicar un flujo TDD consistente en este repositorio:

1. Aclarar primero los casos de uso.
2. Definir casos de prueba desde esos casos de uso.
3. Escribir tests antes de implementar.
4. Implementar el cambio minimo para pasar.
5. Verificar comportamiento y reportar cobertura/riesgos.

Si hay tension entre velocidad y orden, mantener el orden TDD: **primero tests, luego codigo**.

## Cuando aplicar

Aplicar automaticamente cuando el usuario pida:

- agregar una feature
- arreglar un bug
- cambiar comportamiento
- refactorizar logica con garantias de comportamiento
- "hacer TDD", "crear casos de uso", "definir tests", "test first"

## Contexto de tests en este repo

### Donde estan los tests

Estructura actual del monorepo:

- `app`: frontend React + Vite
- `api`: backend TypeScript
- `packages/shared`: utilidades compartidas

Ubicacion recomendada de tests unitarios:

- Co-localizados junto al codigo productivo (`*.test.ts` o `*.test.tsx`)
- Ejemplos:
  - `app/src/lib/timeline.test.ts`
  - `api/src/lib/health.test.ts`
  - `packages/shared/src/index.test.ts`

Regla practica:

- Si el modulo vive en `src/foo/bar.ts`, su test debe vivir como primera opcion en `src/foo/bar.test.ts`.

### Como se implementan los tests

Framework base:

- Runner/assertions: `Vitest` en todos los workspaces.
- Frontend (`app`): entorno `jsdom` y setup en `app/src/test/setup.ts`.

Patron minimo de implementacion:

1. `describe(<unidad de comportamiento>)`
2. `it(<resultado observable>)`
3. estructura Given/When/Then dentro del test
4. assertions sobre comportamiento (no sobre detalles internos)

Guia para nombres de tests:

- Bueno: `returns base title when there are no posts`
- Evitar: `calls helper X with param Y`

### Como se verifican los tests

Comandos canonicos:

- Suite completa del monorepo:
  - `npm run test`
- Modo watch:
  - `npm run test:watch`
- Por workspace:
  - `npm run test -w app`
  - `npm run test -w api`
  - `npm run test -w packages/shared`
- Validacion de tipos/lint:
  - `npm run lint`

Secuencia de verificacion esperada en TDD:

1. Ejecutar test puntual y confirmar RED.
2. Implementar cambio minimo.
3. Re-ejecutar test puntual y confirmar GREEN.
4. Ejecutar `npm run test` para regresiones del monorepo.
5. Ejecutar `npm run lint` si hubo cambios de codigo/config.

Evidencia minima a reportar:

- comando(s) ejecutados
- test(s) que fallaron en RED
- test(s) que pasan en GREEN
- riesgos remanentes o gaps de cobertura

## Flujo obligatorio

Copia esta checklist y mantenla actualizada:

```md
TDD Progress
- [ ] Paso 1: Aclarar casos de uso
- [ ] Paso 2: Convertir casos de uso en casos de prueba
- [ ] Paso 3: Escribir primero tests en falla (RED)
- [ ] Paso 4: Implementar codigo minimo (GREEN)
- [ ] Paso 5: Refactor seguro si aplica (REFACTOR)
- [ ] Paso 6: Verificar y reportar resultados
```

### Paso 1: Aclarar casos de uso

Antes de editar codigo productivo, definir:

- actor/contexto
- entrada/disparador
- salida/efecto esperado
- casos borde
- rutas de error

Escribirlos en bullets cortos. Si hay ambiguedad, hacer preguntas de aclaracion antes de codificar.

### Paso 2: Convertir casos de uso en casos de prueba

Por cada caso de uso, definir al menos:

- un test de happy path
- un test de caso borde
- un test de fallo/error (cuando aplique)

Mapear cada caso de uso a nombres de test con relacion 1:1 cuando sea posible.

Plantilla:

```md
Caso de uso: <nombre>
- Given: <estado inicial>
- When: <accion>
- Then: <resultado esperado>
- Archivo de test: <path>
- Nombre de test: <titulo it/describe>
```

### Paso 3: Escribir primero tests en falla (RED)

Reglas:

- Crear o actualizar tests **antes** de implementar.
- Correr tests puntuales y confirmar que fallen por la razon esperada.
- Si es bugfix: primero reproducir el bug con un test en falla.

Evidencia a capturar en la respuesta:

- comando de test ejecutado
- nombres de tests fallando
- razon corta del fallo

### Paso 4: Implementar codigo minimo (GREEN)

Reglas:

- Implementar solo lo necesario para pasar tests en falla.
- Evitar refactors no relacionados mientras se pasa de RED a GREEN.
- Mantener cambios pequenos y locales.

### Paso 5: Refactor seguro (REFACTOR)

Opcional, solo despues de GREEN:

- mejorar legibilidad
- remover duplicacion
- mantener comportamiento sin cambios

Correr tests afectados despues de cada refactor no trivial.

### Paso 6: Verificar y reportar

Siempre correr:

1. tests puntuales del area cambiada
2. suite mas amplia cuando el riesgo sea medio/alto
3. validacion de lint en archivos editados, si aplica

Reportar con este formato:

```md
Reporte de verificacion
- Casos de uso cubiertos: <n>/<total>
- Tests agregados: <lista>
- Tests actualizados: <lista>
- Comandos ejecutados: <lista>
- Resultado: <pass/fail + detalles clave>
- Riesgos remanentes: <bullets o "none identified">
```

## Reglas de enforcement

- No iniciar implementacion antes de definir casos de prueba.
- Si no se pueden escribir tests, explicar explicitamente por que y proponer alternativa de verificacion.
- Priorizar tests deterministas sobre asserts dependientes de tiempo.
- Mantener nombres de tests orientados a comportamiento, no a implementacion.
- Para bugs reportados, el test de reproduccion es obligatorio antes del fix.

## Prompts practicos

Usar estas preguntas internamente durante el trabajo:

- "Que caso de uso cubre esta linea de codigo?"
- "Que test en falla demuestra que falta este comportamiento?"
- "Cual es el cambio minimo para pasar de RED a GREEN?"
- "Como verificamos que no hubo regresiones?"

## Contrato de salida

Cuando se use este skill, la respuesta debe incluir:

1. casos de uso explicitos
2. plan de pruebas explicito y atado a casos de uso
3. confirmacion de que los tests se escribieron primero
4. resultados de verificacion con comandos ejecutados

Si falta algun punto, marcarlo explicitamente como gap antes de cerrar.
