---
name: tdd-feature-first
description: Guia la implementacion de features con metodologia TDD. Usar cuando se pida crear o modificar un feature y se requiera definir tests primero, luego implementar codigo.
---

# TDD Feature First

## Objetivo
Asegurar que todo feature nuevo o cambio funcional se construya con TDD: primero pruebas, despues implementacion minima, y finalmente refactor con cobertura de casos clave.

## Contexto del proyecto (referencia obligatoria)
- Antes de ejecutar esta skill, leer `docs/testing-and-tdd.md`.
- Usar ese documento como fuente principal para:
  - comandos de prueba por workspace/scope
  - reglas de cierre por feature
  - convenciones de evidencia rojo -> verde -> refactor

## Flujo obligatorio
1. **Definir alcance del feature**
   - Confirmar comportamiento esperado, criterios de aceptacion y limites.
   - Enumerar casos nominales, bordes y errores.

2. **Escribir tests antes del codigo**
   - Crear primero tests que describan el comportamiento objetivo.
   - Incluir al menos:
     - caso feliz
     - un caso borde
     - un caso de error o validacion
   - NO escribir implementacion del feature en este paso.
   - Crea los tests necesarios para el feature, valida con el usuario los casos de prueba.

3. **Ejecutar tests y verificar fallo**
   - Ejecutar solo los tests relevantes del feature.
   - Confirmar que al menos un test nuevo falla por ausencia de implementacion.
   - Si todos pasan, ajustar pruebas hasta capturar el comportamiento faltante.

4. **Implementar minimo para pasar**
   - Escribir la menor cantidad de codigo necesaria para pasar los tests nuevos.
   - Evitar sobre-ingenieria y funcionalidades no solicitadas.

5. **Refactorizar sin romper comportamiento**
   - Mejorar nombres, duplicacion y estructura.
   - Mantener los tests verdes durante el refactor.

6. **Validacion final obligatoria**
   - Ejecutar `npm run test`.
   - Si el linter/reportes del IDE muestran errores nuevos, corregir antes de cerrar.
   - Documentar brevemente:
     - tests agregados
     - comportamiento cubierto
     - riesgos o gaps pendientes

## Restricciones
- SIEMPRE escribir tests antes de implementar el feature.
- SIEMPRE demostrar un ciclo rojo -> verde -> refactor.
- NUNCA cerrar una tarea de feature con tests nuevos sin ejecutar.
- NUNCA mezclar cambios no relacionados con el feature.

## Checklist de cierre
- [ ] Casos del feature definidos (feliz, borde, error).
- [ ] Tests escritos antes de la implementacion.
- [ ] Evidencia de test en rojo inicial.
- [ ] Implementacion minima con tests en verde.
- [ ] Refactor completado sin regresiones.
- [ ] `npm run test` ejecutado correctamente.
