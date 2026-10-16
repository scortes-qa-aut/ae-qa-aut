# Resolución del Challenge — QA Automation

Documento que responde punto por punto lo solicitado, referenciando la implementación concreta en cada uno de los tres proyectos.

---

## 📦 Resumen de la solución

Se desarrollaron **tres proyectos independientes** que cubren las capas solicitadas:

| Capa | Proyecto | Carpeta |
|---|---|---|
| **API** | `ae-qa-api-playwright` | [ver carpeta](https://github.com/scortes-qa-aut/ae-qa-aut/tree/main/ae-qa-api-playwright) |
| **Web** | `ae-qa-web-wdio-cucumber` | [ver carpeta](https://github.com/scortes-qa-aut/ae-qa-aut/tree/main/ae-qa-web-wdio-cucumber) |
| **Mobile** | `ae-qa-mobile-wdio-cucumber` | [ver carpeta](https://github.com/scortes-qa-aut/ae-qa-aut/tree/main/ae-qa-mobile-wdio-cucumber) |

Los tres comparten:

- **TypeScript** como lenguaje.
- **Allure** como reporter con evidencia adjunta (screenshots, logs, request/response).
- **Uso responsable del sitio público**: datos únicos por ejecución, sin paralelismo agresivo, sin volumen alto de requests.
- **Arquitectura en capas** con separación clara entre tests, servicios y clientes HTTP/drivers.

---

## 1. Web

### Qué se automatizó

Flujo de **registro de usuario** end-to-end en [automationexercise.com](https://www.automationexercise.com).

**Escenario**:
1. Navegar al sitio.
2. Registrar un usuario nuevo con datos únicos.
3. Validar que se muestra la confirmación de cuenta creada.

### Cómo se implementó

- **Stack**: WebdriverIO 9 + Cucumber + TypeScript + Allure.
- **Escenario en Gherkin** en `features/register.feature`.
- **Steps atómicos** en `features/step-definitions/`:
  - `common.steps.ts` → navegación.
  - `register.steps.ts` → registro completo.
- **Page Object Model** en `pageobjects/RegisterPage.ts` con getters y métodos:
  - `startSignup(name, email)`: llena el formulario inicial.
  - `completeForm(password, firstName, lastName)`: completa el formulario extendido.
  - `isAccountCreated()`: valida el header "Account Created!".
- **Estado compartido** entre steps en `features/support/state.ts`.
- **Datos únicos por ejecución**: el email se genera con `Date.now()`.

### Evidencia

Cada paso del escenario adjunta automáticamente al reporte de Allure:
- **Screenshot** del navegador en ese momento.
- **Log textual** con el nombre del step y su estado.

En caso de fallo, se adjunta además:
- **HTML completo** de la página.
- **Mensaje de error** detallado.

### Cómo correrlo

```bash
cd ae-qa-web-wdio-cucumber
npm install
npx wdio run wdio.conf.ts --spec features/register.feature
npx allure-commandline serve allure-results
```

---

## 2. Mobile

### Qué se automatizó

El **mismo flujo de registro**, pero ejecutado en **Chrome sobre Android real** vía BrowserStack.

**Escenario**: idéntico al web en cuanto a pasos y validaciones, pero con particularidades de viewport mobile.

### Cómo se implementó

- **Stack**: WebdriverIO 9 + Cucumber + TypeScript + BrowserStack + Allure.
- **Escenario en Gherkin** en `features/register.feature` (mismo texto que el web).
- **Page Object reutilizado** desde el proyecto web, con ajustes específicos para mobile:
  - Pausas post-navegación por latencia de red.
  - `scrollIntoView()` antes de interactuar con elementos fuera del viewport.
  - Timeouts más altos (20-30s).
- **Configuración BrowserStack** en `wdio.conf.ts`:
  - Credenciales vía `.env` (no commiteadas).
  - Capabilities con `bstack:options` apuntando a `hub.browserstack.com`.
  - Sin Appium local: BrowserStack provee el servidor Appium remoto.
- **Evidencia dual**:
  - Reporte Allure local con screenshots y logs por paso.
  - Dashboard de BrowserStack con video, logs de red y logs de Appium.

### Estado

El proyecto está **implementado y listo para ejecutar**. No fue corrido end-to-end por falta de acceso a un dispositivo Android al momento del desarrollo.

**Qué está verificado**:
- El código compila (`npx tsc --noEmit` pasa sin errores).
- Los Page Objects y steps son idénticos a los del proyecto web, que sí fue ejecutado.
- La configuración de BrowserStack sigue la documentación oficial.

**Qué falta verificar**:
- Ejecución real sobre dispositivo Android vía BrowserStack.
- Posibles ajustes de `deviceName` / `platformVersion` según disponibilidad del plan.

### Cómo correrlo

```bash
cd ae-qa-mobile-wdio-cucumber
npm install
cp .env.example .env
# Completar BROWSERSTACK_USERNAME y BROWSERSTACK_ACCESS_KEY en .env
npx wdio run wdio.conf.ts --spec features/register.feature
npx allure-commandline serve allure-results
```

---

## 3. API

### Qué se automatizó

Se cubrieron **tres endpoints** de la [lista pública](https://www.automationexercise.com/api_list):

| Endpoint | Método | Qué valida |
|---|---|---|
| `/api/productsList` | GET | Lista de productos con estructura consistente |
| `/api/verifyLogin` | POST | Login con credenciales válidas |
| `/api/getUserDetailByEmail` | GET | Detalle de usuario (positivo + negativo) |

### Camino elegido

Se optó por **Playwright** como runner de pruebas de API, en un proyecto separado (`ae-qa-api-playwright`).

**Razones**:
- Playwright provee `APIRequestContext` nativo, sin necesidad de librerías HTTP adicionales.
- El runner maneja fixtures, reporters y paralelización out-of-the-box.
- Allure se integra directamente con `allure-playwright`.

### Cómo se implementó

- **Stack**: Playwright Test + TypeScript + Allure.
- **Arquitectura en capas**:
  - **Test**: orquesta el flujo y valida resultados.
  - **Service**: lógica de negocio por recurso (`AccountService`, `ProductService`).
  - **Client**: wrapper HTTP con enmascaramiento de datos sensibles (`ApiClient`).
  - **Request**: `APIRequestContext` de Playwright inyectado por fixture.
- **Fixtures** en `src/fixtures/api.fixture.ts` que inyectan los servicios automáticamente.
- **Aserciones centralizadas** en `src/utils/assertApiResponse.ts`:
  - `assertApiSuccess(body, code)`: valida respuesta exitosa.
  - `assertApiError(body, code)`: valida respuesta de error con mensaje.
- **Enmascaramiento** de campos sensibles (`password`, `token`, `api_key`, `authorization`) antes de adjuntarlos a Allure.
- **Datos únicos por test**: emails generados con `Date.now()`.
- **Cleanup garantizado**: `afterEach` elimina los usuarios creados, incluso si el test falla.

### Particularidad de la API

La API de `automationexercise.com` **siempre devuelve HTTP 200**, incluso en errores (404, 400, 201). El código de negocio real viene dentro del body en el campo `responseCode`.

**Implicancia**: todas las aserciones se hacen sobre `body.responseCode`, no sobre `response.status()`.

### Cobertura

- **API 1 (productsList)**: happy path + validación de estructura + consistencia de precios.
- **API 7 (verifyLogin)**: happy path + validación del mensaje "User exists".
- **API 14 (getUserDetailByEmail)**: caso positivo + caso negativo (email inexistente → `responseCode: 404`).

### Evidencia

Cada llamada HTTP adjunta al reporte de Allure:
- **Request** con payload (datos sensibles enmascarados).
- **Response** con el body completo.
- **Tiempo de respuesta** como dato informativo (no bloqueante, porque el sitio es público sin SLA).

### Cómo correrlo

```bash
cd ae-qa-api-playwright
npm install
npx playwright test
npx allure-commandline serve allure-results
```

---

## 4. Decisiones técnicas transversales

### Datos únicos por ejecución

El sitio es público y compartido. Cada test genera emails con timestamp para evitar colisiones:

```typescript
const email = `qa_${Date.now()}@example.com`;
```

### Uso responsable del sitio

- `maxInstances: 1` en WDIO.
- `workers: 1` en Playwright.
- Sin loops masivos ni concurrencia sobre el mismo endpoint.
- Cleanup garantizado en `afterEach` / `afterScenario`.

### Evidencia completa

Todos los tests adjuntan al reporte Allure:

- **Web / Mobile**: screenshot + log por paso.
- **API**: request + response por llamada HTTP.
- **Todos**: metadatos (epic, feature, story, severity, tags) y environment.

### Credenciales fuera del código

- **Web / API**: sin credenciales (sitio público).
- **Mobile**: credenciales de BrowserStack en `.env`, con `.env.example` como plantilla.

---

## 5. Estado de cada proyecto

| Capa | Estado | Ejecutado end-to-end |
|---|---|---|
| API | ✅ Completo | ✅ Sí |
| Web | ✅ Completo | ✅ Sí |
| Mobile | ✅ Implementado | ⚠️ No ejecutado (sin dispositivo) |

---

## 6. Cómo navegar este conjunto de proyectos

1. Empezá por el **README principal** (`README.md`) para la vista general.
2. La arquitectura general está en **`docs/architecture.md`**.
3. Cada proyecto tiene su propio README con instrucciones específicas:
   - [`ae-qa-api-playwright`](https://github.com/tu-usuario/ae-qa-api-playwright)
   - [`ae-qa-web-wdio-cucumber`](https://github.com/tu-usuario/ae-qa-web-wdio-cucumber)
   - [`ae-qa-mobile-wdio-cucumber`](https://github.com/tu-usuario/ae-qa-mobile-wdio-cucumber)

---

## 7. Comandos rápidos por proyecto

### API

```bash
cd ae-qa-api-playwright
npm install
npx playwright test
npx allure-commandline serve allure-results
```

### Web

```bash
cd ae-qa-web-wdio-cucumber
npm install
npx wdio run wdio.conf.ts
npx allure-commandline serve allure-results
```

### Mobile

```bash
cd ae-qa-mobile-wdio-cucumber
npm install
cp .env.example .env   # completar credenciales de BrowserStack
npx wdio run wdio.conf.ts --spec features/register.feature
npx allure-commandline serve allure-results
```