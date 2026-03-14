---
name: modifying-database
description: Define el flujo para crear y aplicar cambios de base de datos con Supabase en este proyecto. Usar cuando se requiera modificar el schema de la base datos, crear migraciones SQL, ejecutar migraciones, o recuperar una base local con migraciones corruptas.
---

# Modifying Database

## Proposito

Usa este skill para aplicar cambios de base de datos en este proyecto con un flujo simple y consistente usando Supabase CLI.

## Cuando aplicar

Aplicar automaticamente cuando el usuario pida:

- crear o editar tablas, columnas, indices, constraints o politicas RLS
- generar una migracion
- correr migraciones locales
- recuperar una base local cuando las migraciones estan corruptas

## Flujo obligatorio

### 1) Crear archivo de migracion

Generar la migracion con:

```bash
supabase migration new nombre_migracion
```

Esto crea un archivo SQL nuevo en el directorio de migraciones de Supabase.

### 2) Escribir el cambio de base de datos

Editar el archivo generado y agregar el SQL necesario para el cambio (DDL/DML segun corresponda).

Reglas practicas:

- mantener cambios pequenos y enfocados por migracion
- usar nombres de migracion descriptivos
- evitar mezclar cambios no relacionados en un mismo archivo

### 3) Ejecutar migracion

Aplicar migraciones con:

```bash
supabase migration up
```

### 4) (Opcional) Recuperacion por migraciones corruptas

Si el historial de migraciones local esta corrupto o inconsistente, resetear la base con:

```bash
supabase db reset
```

Despues del reset, volver a validar que la base levanta con las migraciones esperadas.

## Checklist rapido

- [ ] Crear migracion con `supabase migration new nombre_migracion`
- [ ] Escribir SQL en el archivo creado
- [ ] Ejecutar `supabase migration up`
