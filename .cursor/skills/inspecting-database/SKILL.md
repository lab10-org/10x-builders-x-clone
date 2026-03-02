---
name: inspecting-database
description: Explica como inspeccionar la base de datos local de Supabase. Usar cuando se necesite explorar esquema, tablas o datos.
---

# Inspecting Database

## Objetivo
Permitir inspecciones seguras de la base de datos local del proyecto usando el servidor MCP `local-postgres` en modo solo lectura, evitando cambios accidentales en datos o esquema.

## Servidor MCP del proyecto (fijo)
- SIEMPRE usar el servidor MCP ya registrado:
  - `local-postgres`
- Este servidor ya apunta a Postgres local con:
  - `DATABASE_URL` o fallback `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

## Flujo obligatorio
1. **Listar esquemas con tool dedicada**
   - Ejecutar `list_schemas`.
   - Usar este resultado como punto de partida antes de consultas ad-hoc.

2. **Listar objetos por esquema**
   - Ejecutar `list_objects` con el `schema` objetivo (ej. `public`, `auth`, `storage`).
   - Confirmar tipo de objeto antes de inspeccionar datos (tabla, vista, secuencia, funcion, procedimiento).

3. **Inspeccionar datos y catalogo en modo read-only**
   - Ejecutar `execute_sql` para consultas de lectura.
   - Consultas permitidas (ejemplos):
     - `SELECT * FROM nombre_tabla LIMIT 20;`
     - `SELECT count(*) FROM nombre_tabla;`
     - Consultas sobre `information_schema` y `pg_catalog`.

4. **Usar `execute_sql_with_rollback` solo para pruebas controladas**
   - Usar unicamente cuando se necesite probar SQL que escribe.
   - Esta tool abre transaccion con permisos de escritura y SIEMPRE hace rollback.
   - Verificar la intencion de prueba y confirmar luego con una consulta read-only que no hubo persistencia.

5. **Cerrar con validacion**
   - Confirmar que las inspecciones regulares se hicieron con `list_schemas`, `list_objects` y `execute_sql`.
   - Confirmar que cualquier prueba de escritura se ejecuto con `execute_sql_with_rollback`.

## Restricciones
- SIEMPRE priorizar tools dedicadas (`list_schemas`, `list_objects`) antes de SQL libre.
- SIEMPRE usar `execute_sql` para inspeccion de datos y esquema.
- NUNCA usar `execute_sql` para DML/DDL (`INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `ALTER`, `DROP`, `CREATE`, `GRANT`, `REVOKE`).
- SIEMPRE usar `execute_sql_with_rollback` para pruebas de escritura que no deben persistir.
- NUNCA usar este skill para migraciones, seeds o cambios estructurales permanentes.

## Troubleshooting minimo
- Si `local-postgres` no responde, confirmar que el servidor MCP este registrado en `.cursor/mcp.json` y activo.
- Si hay error de conexion a BD, confirmar que Supabase local este arriba y respondiendo en `127.0.0.1:54322`.
- Si una consulta falla por relacion inexistente o esquema incorrecto, ejecutar primero `list_schemas` y luego `list_objects`.
- Si `execute_sql` rechaza una consulta, mover la prueba a `execute_sql_with_rollback` solo si realmente requiere escritura.

## Checklist de cierre
- [ ] Se uso el servidor MCP `local-postgres`.
- [ ] Se ejecutaron `list_schemas` y/o `list_objects` para descubrir estructura.
- [ ] Las inspecciones se hicieron con `execute_sql` en modo read-only.
- [ ] Cualquier prueba de escritura se hizo con `execute_sql_with_rollback`.
- [ ] No hubo cambios persistentes en datos o esquema.
