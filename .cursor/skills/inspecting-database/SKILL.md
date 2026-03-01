---
name: inspecting-database
description: Explica como inspeccionar la base de datos local de Supabase con psql en modo read-only. Usar cuando se necesite explorar esquema, tablas o datos sin modificar informacion.
---

# Inspecting Database

## Objetivo
Permitir inspecciones seguras de la base de datos local del proyecto usando `psql` en modo solo lectura, evitando cambios accidentales en datos o esquema.

## Conexion del proyecto (fija)
- SIEMPRE usar esta URL para Supabase local:
  - `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

## Flujo obligatorio
1. **Abrir sesion read-only**
   - Ejecutar `psql` con `PGOPTIONS` para forzar transacciones de solo lectura:
   - `PGOPTIONS='-c default_transaction_read_only=on' psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'`

2. **Verificar estado de solo lectura**
   - Confirmar al inicio de la sesion:
   - `SHOW default_transaction_read_only;`
   - Debe devolver `on`.

3. **Ejecutar inspecciones permitidas**
   - Metacomandos de catalogo:
     - `\dn` (schemas)
     - `\dt` (tablas)
     - `\d+ nombre_tabla` (detalle de tabla)
   - SQL de lectura:
     - `SELECT * FROM nombre_tabla LIMIT 20;`
     - `SELECT count(*) FROM nombre_tabla;`
     - Consultas sobre `information_schema` y `pg_catalog`.

4. **Usar patron seguro para consultas ad-hoc**
   - Para una consulta puntual desde terminal, usar:
   - `PGOPTIONS='-c default_transaction_read_only=on' psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' -c "SELECT now();"`

5. **Cerrar con validacion**
   - Verificar que no hubo intencion de escritura en el historial de comandos.
   - Cerrar sesion con `\q`.

## Restricciones
- SIEMPRE conectarse con `PGOPTIONS='-c default_transaction_read_only=on'`.
- SIEMPRE validar `SHOW default_transaction_read_only;` al iniciar.
- NUNCA ejecutar comandos DML/DDL: `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `ALTER`, `DROP`, `CREATE`, `GRANT`, `REVOKE`.
- NUNCA usar este skill para migraciones, seeds o cambios estructurales.

## Troubleshooting minimo
- Si `psql` no conecta, confirmar que Supabase local este arriba antes de reintentar.
- Si una consulta falla por permisos o relacion inexistente, inspeccionar primero con `\dn`, `\dt` y `\d+`.
- Si `default_transaction_read_only` no devuelve `on`, reconectar usando el comando exacto definido en esta skill.

## Checklist de cierre
- [ ] Conexion realizada con la URL local correcta.
- [ ] Sesion iniciada con `PGOPTIONS` en read-only.
- [ ] Verificacion `SHOW default_transaction_read_only;` devuelve `on`.
- [ ] Solo se ejecutaron comandos de inspeccion (catalogo + `SELECT`).
- [ ] Sesion cerrada sin cambios en datos o esquema.
