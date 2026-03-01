---
name: creating-skill
description: Disena y redacta skills de alta calidad para Cursor con estructura estandar, frontmatter efectivo y flujo de validacion. Usar cuando el usuario pida crear, mejorar o estandarizar un SKILL.md o una carpeta de skill.
---

# Creating Skill

## Objetivo
Crear skills claros, activables y mantenibles siguiendo revelacion progresiva, instrucciones deterministas y metadatos precisos.

## Flujo obligatorio

1. **Descubrir requisitos**
   - Confirmar: objetivo, alcance, triggers, formato de salida y ubicacion (`.cursor/skills/` o `~/.cursor/skills/`).
   - Si falta informacion critica, preguntar antes de escribir archivos.

2. **Disenar interfaz del skill**
   - Definir `name` en kebab-case y <= 64 caracteres.
   - Redactar `description` en tercera persona con:
     - **QUE** hace el skill.
     - **CUANDO** debe activarse (palabras trigger).

3. **Crear estructura base**
   - Estructura recomendada:
     - `skill-name/SKILL.md`
     - `skill-name/references/` (si hay contexto pesado)
     - `skill-name/examples/` (si hay ejemplos reutilizables)
     - `skill-name/scripts/` (si hay pasos fragiles o repetibles)

4. **Redactar instrucciones**
   - Escribir instrucciones en modo imperativo y verificable.
   - Usar palabras de control cuando aplique: `SIEMPRE`, `NUNCA`, `CRITICAL`.
   - Priorizar pasos binarios y observables sobre prosa ambigua.
   - Si una accion puede automatizarse, preferir script en `scripts/`.

5. **Integrar verificacion**
   - Incluir un paso final de validacion.
   - Si hay checks o tests, exigir ejecucion antes de cerrar la tarea.
   - Si falla, corregir y reintentar.

## Principios no negociables

1. **Revelacion progresiva**
   - Mantener `SKILL.md` enfocado.
   - Mover detalle largo a `references/` y enlazarlo.

2. **Determinismo**
   - Scripts > explicaciones largas para tareas exactas.
   - Evitar "interpretaciones" cuando una herramienta puede decidir.

3. **Interfaz explicita**
   - La descripcion debe disparar activacion correcta.
   - Evitar descripciones vagas tipo "ayuda con varias cosas".

## Reglas de calidad

- `SKILL.md` por debajo de 500 lineas.
- Terminologia consistente en todo el skill.
- Nada de rutas estilo Windows (usar `/`).
- No incluir informacion temporal que caduque rapido.
- Enlazar archivos de referencia a un solo nivel de profundidad.

## Plantilla minima de `SKILL.md`

```markdown
---
name: skill-name
description: Explica que hace y cuando usarlo, incluyendo triggers concretos.
---

# Skill Name

## Objetivo
[Resultado esperado del skill]

## Flujo obligatorio
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

## Restricciones
- SIEMPRE [regla critica]
- NUNCA [regla critica]
```

## Checklist de validacion final

- [ ] Nombre en kebab-case y valido.
- [ ] Descripcion en tercera persona con QUE + CUANDO.
- [ ] Flujo paso a paso claro e imperativo.
- [ ] Verificacion final incluida.
- [ ] SKILL.md < 500 lineas.
- [ ] Referencias y scripts solo cuando aportan claridad o determinismo.
