---
name: executing-browser
description: Automatiza acciones en el navegador con agent-browser (CLI) para pruebas E2E, flujos de login y verificación de UI. Usar cuando se necesite abrir URLs, hacer snapshot del DOM, interactuar por refs (@e1, @e2) o capturar pantallas.
---

# Executing Browser (agent-browser)

## Proposito

Usa este skill para controlar un navegador desde terminal con **agent-browser** (CLI de Vercel Labs). Sirve para:

- Probar flujos de la app (login, publicar, navegar)
- Obtener el árbol de accesibilidad con refs para que la IA decida qué hacer
- Interactuar por refs (`@e1`, `@e2`) en lugar de selectores frágiles
- Capturar pantallas o PDFs
- Ver la app en modo headed para depurar

Documentación: [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)

## Flujo recomendado (patrón snapshot → refs)

1. **Abrir la página**
   ```bash
   agent-browser open http://localhost:5173
   ```

2. **Obtener snapshot con refs** (árbol de accesibilidad; las refs son estables para la IA)
   ```bash
   agent-browser snapshot -i
   ```
   `-i` = solo elementos interactivos (botones, inputs, enlaces). Opcional: `-c` (compacto), `-d 5` (profundidad máx).

3. **Interactuar por ref** (usar las refs que salen en el snapshot, p. ej. `[ref=e2]`)
   ```bash
   agent-browser click @e2
   agent-browser fill @e3 "texto"
   agent-browser type @e4 "otro texto"
   ```

4. **Si la página cambió**, volver a hacer snapshot y seguir con las nuevas refs.

5. **Cerrar cuando termines**
   ```bash
   agent-browser close
   ```

## Compatibilidad con frameworks reactivos (React 19, Vue, etc.)

> **IMPORTANTE:** `fill` y `click` de agent-browser usan Playwright internamente. En apps con React 19+ (o cualquier framework con inputs controlados), estos comandos pueden NO disparar los handlers de React correctamente porque el sistema de delegación de eventos difiere del DOM nativo.

### Síntomas del problema

- `fill @eN "texto"` setea el valor visible en el DOM pero el estado del framework no se actualiza (el botón puede mostrarse habilitado en el snapshot pero internamente el estado sigue vacío).
- `click @eN` no dispara el `onClick` de React aunque el botón aparezca como interactivo en el snapshot.
- El formulario parece funcionar visualmente pero no ejecuta lógica de negocio (no hay requests en los logs de red).

### Solución: usar `eval` con eventos nativos

Para inputs controlados (React, Vue, etc.), reemplazar `fill` y `click` por `eval`:

**Llenar un input/textarea:**
```bash
agent-browser eval "
var el = document.querySelector('textarea[aria-label=\"Mi textarea\"]');
var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
setter.call(el, 'Texto a ingresar');
el.dispatchEvent(new Event('input', { bubbles: true }));
"
```

Para `<input>`, cambiar `HTMLTextAreaElement` por `HTMLInputElement`.

**Hacer click en un botón:**
```bash
agent-browser eval "
var btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Publicar');
btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
"
```

### Cuándo aplica

- Apps React 19+ con inputs controlados (`value` + `onChange`)
- Apps Vue con `v-model`
- Apps con formularios que usan `onSubmit` en el `<form>` (el `type="submit"` + click tampoco dispara el handler de React)
- En general: si `fill` + `click` no producen efectos en la red (sin requests en logs), usar `eval`

### Cuándo `fill` y `click` SÍ funcionan

- Formularios de auth (`signIn`, `signUp`) con inputs no controlados o procesados con `form.onSubmit` del DOM nativo → agent-browser SÍ envía la request HTTP correctamente
- Navegación: links (`<a>`), `back`, `forward`, `open`
- Lecturas: `snapshot`, `get text`, `screenshot`

### Patrón recomendado para apps React

```bash
# 1. Abrir y esperar carga
agent-browser open http://localhost:5173 && agent-browser wait --load networkidle

# 2. Snapshot para identificar elementos (verificar estado)
agent-browser snapshot -i

# 3. Llenar campo con eval (garantiza que React actualice su estado)
agent-browser eval "
var el = document.querySelector('[aria-label=\"Email\"]');
var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
setter.call(el, 'user@test.com');
el.dispatchEvent(new Event('input', { bubbles: true }));
"

# 4. Clicar con eval (garantiza que React dispara el onClick)
agent-browser eval "
document.querySelector('button[type=\"submit\"]')
  .dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
"

# 5. Esperar respuesta y verificar
agent-browser wait 2000 && agent-browser snapshot -i
```

---

## Tips importantes

### Encadenar comandos

El navegador persiste entre comandos (daemon). Puedes encadenar con `&&`:

```bash
agent-browser open http://localhost:5173 && agent-browser wait --load networkidle && agent-browser snapshot -i
agent-browser fill @e1 "user@test.com" && agent-browser fill @e2 "pass" && agent-browser click @e3
```

> Nota: para apps React, reemplaza `fill` y `click` por `eval` con eventos nativos (ver sección de compatibilidad arriba).

### Esperas

- Esperar elemento: `agent-browser wait "#submit"`
- Esperar tiempo: `agent-browser wait 2000`
- Esperar texto: `agent-browser wait --text "Bienvenido"`
- Esperar carga: `agent-browser wait --load networkidle` (load, domcontentloaded, networkidle)

### Localizadores semánticos (sin refs)

Cuando no tengas snapshot a mano, puedes usar `find`:

```bash
agent-browser find role button click --name "Enviar"
agent-browser find label "Email" fill "test@test.com"
agent-browser find text "Iniciar sesión" click
```

### Salida JSON (para agentes)

Para parsear desde scripts o IA:

```bash
agent-browser snapshot -i --json
agent-browser get text @e1 --json
agent-browser is visible @e2 --json
```

### Capturas y PDF

```bash
agent-browser screenshot                    # guarda en dir temporal
agent-browser screenshot page.png          # ruta concreta
agent-browser screenshot --full            # página completa
agent-browser screenshot --annotate        # etiquetas numeradas [1]=@e1, [2]=@e2
agent-browser pdf report.pdf
```

### Modo visible (depuración)

```bash
agent-browser open http://localhost:5173 --headed
```

### Sesiones aisladas

Varias instancias independientes (cookies, historial, estado):

```bash
agent-browser --session agent1 open site-a.com
agent-browser --session agent2 open site-b.com
agent-browser session list
```

### Autenticación persistente

- **Perfil persistente** (cookies, storage, sesiones): `agent-browser --profile ./browser-data open ...`
- **Estado desde archivo**: `agent-browser --state ./auth.json open ...`
- **Session name** (auto-guardado de cookies/localStorage): `agent-browser --session-name myapp open ...`

### Timeout por defecto

Por defecto 25 s. Para páginas lentas:

```bash
export AGENT_BROWSER_DEFAULT_TIMEOUT=45000
```

### Configuración por proyecto

Crear `agent-browser.json` en la raíz del proyecto (o `~/.agent-browser/config.json`):

```json
{
  "headed": false,
  "profile": "./browser-data"
}
```

Las variables `AGENT_BROWSER_*` y los flags CLI tienen prioridad sobre el config.

## Comandos útiles de referencia

| Comando | Uso |
|---------|-----|
| `open <url>` | Navegar |
| `snapshot` / `snapshot -i` | Árbol con refs (solo interactivos con `-i`) |
| `click @eN` / `fill @eN "text"` | Interactuar por ref |
| `get text @eN` / `get url` / `get title` | Leer contenido |
| `wait <sel\|ms>` / `wait --load networkidle` | Esperar |
| `screenshot [path]` | Captura |
| `close` | Cerrar navegador |
| `find role button click --name "X"` | Clic por rol/nombre |
| `back` / `forward` / `reload` | Navegación |

Ver todos: `agent-browser --help`

## Checklist rapido

- [ ] Tener Chrome instalado (`agent-browser install` si hace falta)
- [ ] Abrir URL con `open`, luego `snapshot -i` para ver refs
- [ ] Si la app usa React 19+ (o Vue con v-model): usar `eval` con `nativeInputValueSetter` en lugar de `fill`, y `dispatchEvent(MouseEvent 'click')` en lugar de `click`
- [ ] Si la app usa formularios nativos (sin framework reactivo): `fill` y `click` funcionan directamente
- [ ] Para detectar si `fill`/`click` funcionaron: revisar logs de red o que el snapshot cambie (heading, contador, contenido)
- [ ] Re-snapshot si la página cambia
- [ ] Usar `--headed` para depurar o `wait --load networkidle` en SPAs
- [ ] Cerrar con `close` al terminar (o dejar que el daemon siga para más comandos)
