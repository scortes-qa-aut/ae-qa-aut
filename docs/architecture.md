# Arquitectura general

Documento que describe la arquitectura de los tres proyectos de automatización y cómo se relacionan entre sí.

---

## Vista de alto nivel

Los tres proyectos son **independientes** y comparten:

- **Lenguaje**: TypeScript.
- **Reporter**: Allure con evidencia adjunta (screenshots, logs, request/response).
- **Estrategia de datos**: únicos por ejecución (emails con timestamp).
- **Uso responsable** del sitio público: sin paralelismo agresivo, sin volumen alto de requests.
- **Arquitectura en capas**: separación clara entre tests, servicios y clientes.

```
┌─────────────────────────────────────────────────────────┐
│              automationexercise.com                     │
│         (sitio público bajo prueba)                     │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐
   │   API   │      │    Web    │     │  Mobile   │
   │Playwright│     │  WDIO +   │     │  WDIO +   │
   │         │      │ Cucumber  │     │BrowserStack│
   └─────────┘      └───────────┘     └───────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                    ┌─────▼─────┐
                    │  Allure   │
                    │  Reports  │
                    └───────────┘
```

---

## Capas por proyecto

### API (`ae-qa-api-playwright`)

```
Test → Service → ApiClient → APIRequestContext (Playwright)
```

| Capa | Responsabilidad | Ejemplo |
|---|---|---|
| **Test** | Orquesta el flujo y valida resultados | `api-14-user-detail.spec.ts` |
| **Service** | Lógica de negocio por recurso | `AccountService.createUser()` |
| **Client** | Wrapper HTTP con enmascaramiento de datos sensibles | `ApiClient.post()` |
| **Request** | Cliente HTTP de Playwright | `APIRequestContext` inyectado por fixture |

**Flujo típico**:

1. El test importa la fixture `api.fixture.ts`.
2. La fixture inyecta `accountService` y `productService`.
3. El test llama a un método del servicio (ej: `accountService.getUserDetailByEmail(email)`).
4. El servicio delega al `ApiClient`.
5. El `ApiClient` hace la request HTTP y adjunta request/response a Allure.
6. El test valida la respuesta con `assertApiSuccess` o `assertApiError`.

---

### Web (`ae-qa-web-wdio-cucumber`)

```
Feature → Step → PageObject → browser (WebdriverIO)
```

| Capa | Responsabilidad | Ejemplo |
|---|---|---|
| **Feature** | Escenario en Gherkin | `register.feature` |
| **Step** | Implementación de cada paso | `register.steps.ts` |
| **PageObject** | Encapsula selectores y acciones | `RegisterPage.ts` |
| **Browser** | Driver de WebdriverIO | Inyectado por el runner |

**Flujo típico**:

1. Cucumber lee el `.feature` y ejecuta los steps en orden.
2. Cada step llama a métodos del Page Object.
3. El Page Object interactúa con el DOM a través del `browser` global.
4. Los hooks `afterStep` y `afterScenario` adjuntan screenshots y logs a Allure.
5. Al finalizar, el reporter de Allure genera `allure-results/`.

---

### Mobile (`ae-qa-mobile-wdio-cucumber`)

```
Feature → Step → PageObject → browser (WebdriverIO) → BrowserStack Hub → Device real
```

| Capa | Responsabilidad | Ejemplo |
|---|---|---|
| **Feature** | Escenario en Gherkin | `register.feature` |
| **Step** | Implementación de cada paso | `register.steps.ts` |
| **PageObject** | Encapsula selectores y acciones | `RegisterPage.ts` |
| **Browser** | Driver de WebdriverIO (conectado a BrowserStack) | Inyectado por el runner |
| **Hub** | Servidor Appium remoto de BrowserStack | `hub.browserstack.com` |
| **Device** | Dispositivo Android real | `Google Pixel 7` |

**Flujo típico**:

1. WDIO lee `wdio.conf.ts` y ve las credenciales de BrowserStack (desde `.env`).
2. Se conecta a `hub.browserstack.com` y solicita un dispositivo Android.
3. BrowserStack levanta una sesión de Chrome en un dispositivo real.
4. Los steps y Page Objects se ejecutan de la misma forma que en web.
5. Cada comando viaja al dispositivo, se ejecuta y vuelve.
6. El dashboard de BrowserStack graba video, logs de red y logs de Appium.
7. Al finalizar, Allure genera el reporte local con los adjuntos.

**Particularidades mobile**:

- Pausas de 2 segundos post-navegación (latencia de red + renderizado mobile).
- `scrollIntoView()` antes de interactuar con elementos fuera del viewport.
- Timeouts más altos (20-30s) por la latencia hacia BrowserStack.

---

## Flujo de evidencia

Todos los proyectos adjuntan al reporte Allure:

### Web / Mobile

- **Screenshot** del navegador por cada paso.
- **Log textual** con el nombre del step y su estado (`✅` o `❌`).
- **HTML completo** de la página en caso de fallo.
- **Mensaje de error** detallado.

### API

- **Request** con payload (datos sensibles enmascarados: `password`, `token`, `api_key`, `authorization`).
- **Response** con el body completo.
- **Tiempo de respuesta** como dato informativo (no bloqueante).

### Todos

- **Metadatos**: epic, feature, story, severity, tags.
- **Environment**: baseURL, browser, dispositivo, versión de Node.

---

## Composición de datos

### API

- `UserPayload` tipado.
- Convertido a form-encoded con `toFormData()`.
- Email generado con `Date.now()`.

### Web / Mobile

- Estado compartido entre steps en `features/support/state.ts`.
- Datos guardados: `registeredName`, `registeredEmail`, `registeredPassword`.
- El step de registro guarda los datos; los steps posteriores los consultan.

### Todos

- Emails únicos por ejecución: `qa_${Date.now()}@example.com`.
- Sin reutilización de emails entre ejecuciones.

---

## Estructura de directorios (vista general)

```
ae-qa-aut/                          # Repo de documentación
├── README.md
├── RESPONSE_CHALLENGE.md
├── AI_USAGE.md
├── .gitignore
└── docs/
    └── architecture.md

ae-qa-api-playwright/               # Proyecto API
├── src/
│   ├── models/
│   ├── clients/
│   ├── services/
│   ├── fixtures/
│   └── utils/
├── tests/
├── playwright.config.ts
├── tsconfig.json
└── package.json

ae-qa-web-wdio-cucumber/            # Proyecto Web
├── features/
│   ├── register.feature
│   ├── support/
│   └── step-definitions/
├── pageobjects/
├── utils/
├── wdio.conf.ts
├── tsconfig.json
└── package.json

ae-qa-mobile-wdio-cucumber/         # Proyecto Mobile
├── features/
│   ├── register.feature
│   ├── support/
│   └── step-definitions/
├── pageobjects/
├── utils/
├── .env.example
├── wdio.conf.ts
├── tsconfig.json
└── package.json
```

---

## Decisiones de diseño compartidas

### Datos únicos por ejecución

El sitio es público y compartido. Si dos ejecuciones usan el mismo email, la segunda falla con "email already exists". Por eso cada test genera emails con `Date.now()`.

### Uso responsable del sitio

- `maxInstances: 1` en WDIO (una sesión a la vez).
- `workers: 1` en Playwright.
- Sin loops masivos ni concurrencia sobre el mismo endpoint.
- Cleanup garantizado con `afterEach` (API) o `afterScenario` (Cucumber).

### Evidencia completa

Todos los tests adjuntan al reporte Allure screenshots, logs y request/response. Esto permite debug sin acceso al entorno donde corrió el test.

### Credenciales fuera del código

- **Web / API**: sin credenciales (sitio público).
- **Mobile**: credenciales de BrowserStack en `.env`, con `.env.example` como plantilla.
- **Nunca** se commitean credenciales reales.

---

## Herramientas comunes

| Herramienta | Uso |
|---|---|
| **TypeScript** | Lenguaje de los tres proyectos |
| **Node.js 18+** | Runtime |
| **Allure** | Reporter con evidencia adjunta |
| **tsx** | Compilador TS para WDIO 9 |
| **dotenv** | Carga de variables de entorno |
| **Git** | Control de versiones (un repo por proyecto + uno de docs) |

---

## Diferencias entre proyectos

| Aspecto | API | Web | Mobile |
|---|---|---|---|
| **Runner** | Playwright Test | WebdriverIO | WebdriverIO |
| **BDD** | No | Cucumber | Cucumber |
| **Driver** | `APIRequestContext` | ChromeDriver | Appium (BrowserStack) |
| **Evidencia principal** | Request/Response | Screenshot | Screenshot |
| **Credenciales** | No | No | BrowserStack |
| **Costo por corrida** | Gratis | Gratis | Minutos del plan |
| **Timeouts** | 30s | 90s | 300s |

---

## Cómo extender la arquitectura

### Agregar un nuevo endpoint al proyecto API

1. Crear el modelo en `src/models/`.
2. Agregar el método al service correspondiente en `src/services/`.
3. Crear el test en `tests/`.
4. Usar los helpers `assertApiSuccess` / `assertApiError`.

### Agregar un nuevo flujo web

1. Crear el `.feature` en `features/`.
2. Crear el Page Object en `pageobjects/`.
3. Implementar los steps en `features/step-definitions/`.
4. Reutilizar steps existentes cuando sea posible.

### Agregar un nuevo flujo mobile

Mismo procedimiento que web, pero tener en cuenta:
- Pausas post-navegación.
- `scrollIntoView()` para elementos fuera del viewport.
- Timeouts más altos.

---

## Referencias

- [Sitio bajo prueba](https://www.automationexercise.com)
- [Documentación WebdriverIO](https://webdriver.io/)
- [Documentación Cucumber](https://cucumber.io/docs/cucumber/)
- [Documentación Playwright](https://playwright.dev/)
- [Documentación Allure](https://docs.qameta.io/allure/)
- [Documentación BrowserStack](https://www.browserstack.com/docs/)