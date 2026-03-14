---
name: inspecting-database
description: Inspecciona la base de datos usando MCP de Supabase en modo solo lectura para debugging, exploracion de esquema y consultas informativas. Usar cuando se requiera entender tablas, migraciones, extensiones, logs o ejecutar SQL de lectura. Nunca modificar la base; los cambios se hacen via migraciones CLI.
---

# Inspecting Database

## Proposito

Usa este skill para entender el estado actual de la base de datos con el MCP de Supabase sin modificar datos ni schema.

Este procedimiento es **read-only** y sirve para:

- debugging
- extraer informacion
- aclarar el esquema actual

## Politica de seguridad (obligatoria)

1. Tratar toda interaccion MCP como solo lectura.
2. **No** usar MCP para modificar la base de datos.
3. **No** ejecutar `apply_migration` desde MCP.
4. Si se requiere cambiar schema o datos, usar migraciones CLI del proyecto:
   - `supabase migration new nombre_migracion`
   - editar SQL de migracion
   - `supabase migration up`
   - si hay corrupcion: `supabase db reset`

## MCP a usar para inspeccion

Servidor MCP: `project-0-10-x-clone-local-database`

Herramientas recomendadas para lectura:

- `list_tables`: listar tablas por schema
- `list_migrations`: revisar estado de migraciones aplicadas
- `list_extensions`: inspeccionar extensiones habilitadas
- `get_logs`: diagnosticar problemas por servicio (`postgres`, `api`, `auth`, etc.)
- `get_advisors`: revisar recomendaciones de seguridad/performance
- `execute_sql`: solo para `SELECT` u otras consultas de lectura

Herramientas a evitar en este skill:

- `apply_migration` (prohibido por politica read-only)

## Flujo recomendado

1. Definir la pregunta de inspeccion (schema, datos, performance o error).
2. Empezar por metadata:
   - `list_tables`
   - `list_migrations`
   - `list_extensions`
3. Si hace falta detalle, usar `execute_sql` con consultas de lectura (`SELECT`).
4. Si el problema es operativo, complementar con:
   - `get_logs`
   - `get_advisors`
5. Reportar hallazgos y, si se necesita cambio, derivar al flujo de migraciones CLI.

## Restricciones para execute_sql

Permitido:

- `SELECT ...`
- consultas de catalogo (`information_schema`, `pg_catalog`)
- `EXPLAIN` sobre consultas de lectura

No permitido:

- `INSERT`, `UPDATE`, `DELETE`
- `CREATE`, `ALTER`, `DROP`, `TRUNCATE`
- `GRANT`, `REVOKE`, `COMMENT`
- cualquier SQL con efectos secundarios

## Checklist rapido

- [ ] Confirmar que el objetivo es inspeccion/debugging
- [ ] Usar solo herramientas MCP de lectura
- [ ] Si se usa `execute_sql`, validar que sea read-only
- [ ] No usar `apply_migration` por MCP
- [ ] Si hay que cambiar DB, moverse a migraciones CLI
