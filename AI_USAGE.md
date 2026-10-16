# Uso de IA en el desarrollo

Documento que describe cómo se usó IA durante el desarrollo de los tres proyectos, qué se delegó y qué se revisó manualmente.

---

## Herramientas usadas

- **Asistente conversacional** (Gemini / ChatGPT) para scaffolding, resolución de errores y revisión de código.

---

## Qué se delegó a la IA

### Scaffolding inicial

- Configuración base de `wdio.conf.ts`, `playwright.config.ts`, `tsconfig.json`.
- Configuración del reporter Allure con adjuntos.
- Boilerplate de Page Objects y steps de Cucumber.

### Resolución de errores específicos

- Compatibilidad con WDIO 9: eliminación de `autoCompileOpts` (deprecado), configuración de `tsx` y `requireModule: ['tsx/cjs']`.
- Tipos incompletos del `Browser` de WDIO 9: creación del helper `utils/browser.ts` con `as any` centralizado.
- Tipos de hooks de Cucumber en WDIO 9: extensión del tipo `Config` para incluir `afterStep` y `afterScenario`.
- Adaptación de Playwright `APIRequestContext` a `fetch` nativo para el proyecto mobile.
- Configuración de BrowserStack para Chrome Android.

### Refactors

- Extracción de aserciones a helpers (`assertApiSuccess`, `assertApiError`).
- Eliminación de `as any` en servicios de API mediante `toFormData()`.
- Arquitectura en capas para el proyecto API (Test → Service → Client → Request).

### Documentación

- Redacción de los tres READMEs y este documento.
- Explicación de decisiones técnicas.

---

## Qué se revisó manualmente


### Comportamiento real del sitio

- Que la API de `automationexercise.com` **siempre devuelve HTTP 200**, incluso en errores. La validación real se hace sobre `responseCode` del body.
- Que los endpoints `POST` esperan `application/x-www-form-urlencoded`, no JSON.
- Que el endpoint `DELETE` recibe parámetros por **query string**, no body.
- Que `verifyLogin` con credenciales inválidas devuelve `responseCode: 404` con mensaje `"User not found!"`.

### Selectores

- Verificación de los `data-qa` reales del DOM (`signup-name`, `signup-email`, `password`, etc.).
- Confirmación de que los selectores funcionan tanto en viewport desktop como mobile.

### Estrategia de datos

- Decisión de generar emails únicos con `Date.now()` en cada ejecución.
- Cleanup garantizado con `afterEach` (API) o `afterScenario` (Cucumber).
- Confirmación de que no dejar basura en el sitio público.

### Decisiones de cobertura

- Elección de endpoints para el proyecto API (productsList, verifyLogin, getUserDetailByEmail).
- Elección del flujo de registro como caso común entre web y mobile.
- Decisión de NO probar los 14 endpoints de la API (volumen innecesario).

### Configuración de entorno

- Elección de `tsx` sobre `ts-node` para WDIO 9.
- Configuración de Chrome visible por defecto, con headless comentado.
- Uso de `maxInstances: 1` para no saturar el sitio público.
- Timeouts altos en mobile por latencia de BrowserStack.

---

## Qué NO se delegó

- Decisiones de qué flujos cubrir.
- Criterios de aserción (qué validar y qué no).
- Estrategia de limpieza y datos únicos.
- Elección de BrowserStack sobre Appium local.
- Estructura general del challenge (tres proyectos separados).

---

## Ejemplos de prompts usados

Algunos prompts representativos:

- "Refactorizá este test para eliminar el `as any` y centralizar aserciones."
- "¿Cómo configuro BrowserStack en WDIO 9 con Chrome Android?"
- "El tipo Browser de WDIO 9 no expone `takeScreenshot`. ¿Cómo lo resuelvo sin llenar el código de casts?"


---

## Lecciones aprendidas

- La IA acelera el scaffolding y la resolución de errores **cuando el problema está bien delimitado**.
- La IA **no conoce el comportamiento específico** de un sitio público: hay que validar todo contra la realidad.
- Los tipos incompletos de librerías (como WDIO 9) requieren intervención manual o workarounds (helper con `as any`).
- Las decisiones siguen siendo responsabilidad del desarrollador, no de la IA.