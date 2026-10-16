# AE QA Automation

Conjunto de **tres proyectos de automatización de pruebas** sobre [automationexercise.com](https://www.automationexercise.com), cubriendo las capas de **Web**, **Mobile** y **API**.

---

## 📦 Proyectos

| Proyecto | Capa | Stack | Carpeta |
|---|---|---|---|
| **API Testing** | API | Playwright + TypeScript + Allure | [`ae-qa-api-playwright`](https://github.com/scortes-qa-aut/ae-qa-aut/tree/main/ae-qa-api-playwright) |
| **Web E2E** | Web | WebdriverIO + Cucumber + TypeScript + Allure | [`ae-qa-web-wdio-cucumber`](https://github.com/scortes-qa-aut/ae-qa-aut/tree/main/ae-qa-web-wdio-cucumber) |
| **Mobile E2E** | Mobile | WebdriverIO + Cucumber + BrowserStack + Allure | [`ae-qa-mobile-wdio-cucumber`](https://github.com/scortes-qa-aut/ae-qa-aut/tree/main/ae-qa-mobile-wdio-cucumber) |

---

## 🎯 Objetivo

Automatizar pruebas que cubran **tres capas** del sitio público `automationexercise.com`:

- **Web**: flujo de registro de usuario end-to-end.
- **Mobile**: el mismo flujo desde Chrome en un dispositivo Android real.
- **API**: endpoints de la [lista pública](https://www.automationexercise.com/api_list).

Todo en **TypeScript**. Web y Mobile con **WebdriverIO + Cucumber** y escenarios en **Gherkin**. API con **Playwright**.

---

## 🏗️ Arquitectura general

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

Cada proyecto es **independiente** y tiene su propio `package.json`, configuración y suite de pruebas. Los tres comparten:

- **TypeScript** como lenguaje.
- **Allure** como reporter con screenshots y logs adjuntos.
- **Datos únicos por ejecución** (emails con timestamp) para no colisionar en un sitio compartido.
- **Uso responsable del sitio público**: sin paralelismo agresivo, sin volumen alto de requests.

---

## 🧪 Cobertura por proyecto

### API (`ae-qa-api-playwright`)

| Endpoint | Método | Qué valida |
|---|---|---|
| `/api/productsList` | GET | Lista de productos con estructura consistente |
| `/api/verifyLogin` | POST | Login con credenciales válidas |
| `/api/getUserDetailByEmail` | GET | Detalle de usuario (positivo + negativo) |

**Particularidad**: la API siempre devuelve HTTP 200, incluso en errores. La validación real se hace sobre el `responseCode` del body.

**Comandos**:

```bash
cd ae-qa-api-playwright
npm install
npx playwright test
npx allure-commandline serve allure-results
```

### Web (`ae-qa-web-wdio-cucumber`)

| Feature | Escenario | Tags |
|---|---|---|
| `register.feature` | Registro exitoso con datos únicos | `@smoke @register` |

**Comandos**:

```bash
cd ae-qa-web-wdio-cucumber
npm install
npx wdio run wdio.conf.ts --spec features/register.feature
npx allure-commandline serve allure-results
```

### Mobile (`ae-qa-mobile-wdio-cucumber`)

| Feature | Escenario | Tags |
|---|---|---|
| `register.feature` | Registro exitoso desde Chrome Android | `@smoke @register @mobile` |

**Estado**: implementado y listo para ejecutar sobre BrowserStack. No fue ejecutado end-to-end por falta de acceso a dispositivo Android al momento del desarrollo.

**Comandos**:

```bash
cd ae-qa-mobile-wdio-cucumber
npm install
cp .env.example .env
# Completar BROWSERSTACK_USERNAME y BROWSERSTACK_ACCESS_KEY en .env
npx wdio run wdio.conf.ts --spec features/register.feature
npx allure-commandline serve allure-results
```

---

## 🧠 Uso de IA

La IA fue una herramienta activa durante todo el desarrollo. El detalle completo está en [`AI_USAGE.md`](AI_USAGE.md).

Resumen:

- **Scaffolding**: estructura de carpetas, configuración de runners y reportes.
- **Resolución de errores**: compatibilidad con WDIO 9, tipos de hooks, adaptación a BrowserStack.
- **Revisión de contratos de API**: validación de `responseCode` vs HTTP status.
- **Adaptación mobile**: pausas y `scrollIntoView` para viewport reducido.

**Qué se revisó manualmente**:

- Comportamiento real del sitio (que la API devuelve 200 en errores).
- Selectores `data-qa` reales del DOM.
- Estrategia de datos únicos y limpieza en `afterEach`.
- Decisiones de qué endpoints y flujos cubrir.

---

## 📊 Reportes Allure

Los tres proyectos generan reportes Allure con la misma estructura:

- **Pasos anidados** por escenario.
- **Screenshots** en cada paso (web y mobile).
- **Request/Response adjuntos** en cada llamada API.
- **Metadatos** (epic, feature, story, severity, tags).
- **Environment** (baseURL, browser, dispositivo, node version).

Para ver cualquier reporte:

```bash
cd <proyecto>
npx allure-commandline serve allure-results
```

---

## ⚙️ Requisitos generales

| Herramienta | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Runtime de los tres proyectos |
| npm | 9+ | Gestor de dependencias |
| Java | 8+ | Requerido por Allure |
| Google Chrome | Última | Web (local) |
| Cuenta BrowserStack | App Automate | Mobile |

---

## 📋 Resumen de comandos por proyecto

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
cp .env.example .env   # completar credenciales
npx wdio run wdio.conf.ts --spec features/register.feature
npx allure-commandline serve allure-results
```

---

## 🔍 Decisiones técnicas transversales

### Datos únicos por ejecución

El sitio es público y compartido. Cada test genera emails con `Date.now()` para evitar colisiones:

```typescript
const email = `qa_${Date.now()}@example.com`;
```

### Uso responsable del sitio

- `maxInstances: 1` en WDIO (una sesión a la vez).
- `workers: 1` en Playwright.
- Sin loops masivos ni tests concurrentes sobre el mismo endpoint.
- Cleanup garantizado con `afterEach` (API) o `afterScenario` (Cucumber).

### Evidencia completa

Todos los tests adjuntan al reporte Allure:

- Screenshots por paso (web y mobile).
- Request/Response por llamada (API).
- HTML de la página en fallos (web y mobile).
- Logs textuales por paso.

### Credenciales fuera del código

- Web y API: sin credenciales (sitio público).
- Mobile: credenciales de BrowserStack en `.env`, con `.env.example` como plantilla.

---

## 📁 Estructura de `ae-qa-aut`

```
ae-qa-aut/
├── README.md              # Este archivo
├── AI_USAGE.md            # Detalle del uso de IA
├── .gitignore
└── docs/
    └── architecture.md    # Diagrama detallado
```

Los tres proyectos viven en repos **separados** y se referencian desde acá. Esto mantiene cada repo autocontenido y portable.

---

## 🚦 Estado de los proyectos

| Capa | Estado | Ejecutado |
|---|---|---|
| API | ✅ Completo | ✅ Sí |
| Web | ✅ Completo | ✅ Sí |
| Mobile | ✅ Implementado | ⚠️ No ejecutado (sin dispositivo) |

---
