---
name: using-chrome
description: Define un flujo confiable para probar interfaces web con el servidor MCP chrome-devtools. Usar cuando el usuario pida pruebas manuales de UI, validacion visual, reproduccion de bugs en navegador, evidencias con screenshots, o inspeccion de consola/red.
---

# Using Chrome

## Objetivo
Ejecutar pruebas de UI tradicionales (manuales, paso a paso y reproducibles) usando el servidor MCP `chrome-devtools`, dejando evidencia clara de resultados, fallas y cobertura.

## Flujo obligatorio
1. **Preparar contexto de prueba**
   - Confirmar URL objetivo y entorno (`local`, `staging` o `prod`).
   - Definir alcance: humo, happy path, regresion puntual o exploratoria guiada.
   - Definir datos de prueba y criterio de exito observable.

2. **Abrir y ubicar la pagina**
   - Listar paginas con `list_pages`.
   - SI existe una pestana util, seleccionarla con `select_page`.
   - SI no existe, crear una con `new_page` y navegar con `navigate_page`.
   - Ajustar viewport con `resize_page` cuando se pruebe responsive.

3. **Capturar estado inicial**
   - Tomar snapshot de estructura con `take_snapshot`.
   - Capturar screenshot base con `take_screenshot`.
   - Esperar solo lo necesario con `wait_for` (esperas cortas e incrementales).

4. **Ejecutar escenario funcional**
   - Interactuar con la UI usando: `click`, `type_text`, `fill`, `fill_form`, `press_key`, `hover`, `drag`.
   - SI se abre dialogo, resolver con `handle_dialog`.
   - Verificar resultado en pantalla con un nuevo `take_snapshot`.

5. **Validar salud tecnica**
   - Revisar consola con `list_console_messages` y detalle con `get_console_message`.
   - Revisar red con `list_network_requests` y detalle con `get_network_request`.
   - SI hay inconsistencia visual, tomar screenshot adicional.

6. **Documentar evidencia**
   - Guardar: pasos ejecutados, resultado esperado vs real, evidencia (snapshots/screenshots) y severidad.
   - Para cada bug: incluir pasos minimos de reproduccion y condicion de salida.

7. **Cerrar sesion**
   - Cerrar pestanas abiertas para la prueba con `close_page` si no se necesitan.
   - Dejar el navegador en estado limpio para la siguiente corrida.

## Procedimientos tradicionales recomendados

### 1) Smoke test (3-5 min)
- Cargar home/login/feed.
- Confirmar que no hay errores bloqueantes de consola/red.
- Validar que los elementos principales renderizan y responden a click.

### 2) Happy path de usuario
- Recorrer el flujo principal de punta a punta.
- Validar mensajes de exito, navegacion y cambios de estado visibles.
- Capturar screenshot en hitos clave (inicio, accion, resultado).

### 3) Regresion puntual de bug
- Reproducir bug con pasos exactos.
- Aplicar la accion que antes fallaba.
- Verificar que ya no ocurre y que no rompiste flujo vecino.

### 4) Validacion de formularios
- Probar campos requeridos, formatos invalidos y limite de longitud.
- Verificar mensajes de error y recuperacion tras correccion.
- Usar `fill_form` cuando sea mas estable que tipado campo por campo.

### 5) Responsive basico
- Repetir flujo minimo en 3 viewports (desktop/tablet/mobile) con `resize_page`.
- Confirmar visibilidad de CTA, menu y formularios.

### 6) Teclado y accesibilidad basica
- Navegar con `press_key` (Tab, Enter, Escape).
- Confirmar foco visible y orden de tabulacion razonable.

## Herramientas MCP disponibles (`chrome-devtools`)

### Navegacion y paginas
- `list_pages`: lista pestanas disponibles.
- `select_page`: selecciona una pestana activa.
- `new_page`: crea una nueva pestana.
- `close_page`: cierra una pestana.
- `navigate_page`: navega a una URL.
- `resize_page`: cambia dimensiones de viewport.
- `emulate`: emulacion de condiciones del navegador/dispositivo.

### Interaccion con UI
- `click`: clic sobre elemento.
- `type_text`: escribe texto (simulacion de teclado).
- `fill`: llena campo directamente.
- `fill_form`: llena varios campos en una sola operacion.
- `press_key`: presiona teclas especiales o combinaciones.
- `hover`: mueve cursor sobre elemento.
- `drag`: arrastra y suelta.
- `upload_file`: carga archivos en inputs tipo file.
- `handle_dialog`: acepta/cancela alert/confirm/prompt.

### Observacion y evidencia
- `take_snapshot`: captura estructura/estado de la pagina.
- `take_screenshot`: captura imagen de la vista actual.
- `wait_for`: espera condicion o tiempo para sincronizar pasos.
- `evaluate_script`: ejecuta JS para inspeccion puntual.

### Consola y red
- `list_console_messages`: lista mensajes de consola.
- `get_console_message`: detalle de un mensaje especifico.
- `list_network_requests`: lista requests de red.
- `get_network_request`: detalle de request/respuesta especifica.

### Performance y memoria
- `performance_start_trace`: inicia traza de rendimiento.
- `performance_stop_trace`: detiene traza y recolecta datos.
- `performance_analyze_insight`: analiza insight de performance.
- `take_memory_snapshot`: captura snapshot de memoria.

## Restricciones
- SIEMPRE ejecutar pruebas con pasos observables y evidencias.
- SIEMPRE validar consola y red al menos una vez por escenario.
- SIEMPRE usar esperas cortas e incrementales en lugar de una sola espera larga.
- NUNCA concluir "ok" sin comparar resultado esperado vs resultado real.
- NUNCA mezclar multiples escenarios en una sola corrida sin separar evidencia.

## Plantilla de reporte rapido
```markdown
Escenario: [nombre]
Entorno: [local/staging/prod]
URL: [ruta]

Pasos:
1. ...
2. ...
3. ...

Resultado esperado:
- ...

Resultado real:
- ...

Evidencia:
- Screenshot: ...
- Snapshot: ...
- Console/Network: ...

Estado final:
- PASS | FAIL
```

## Verificacion final
- [ ] Se definio alcance y criterio de exito antes de ejecutar.
- [ ] Se capturo evidencia inicial y final.
- [ ] Se reviso consola y red.
- [ ] Se documento PASS/FAIL con pasos reproducibles.
- [ ] Se dejaron pestanas/estado limpios para futuras pruebas.
