# AE QA API Testing

Proyecto de automatización de **pruebas de API** sobre los endpoints públicos de [automationexercise.com](https://www.automationexercise.com/api_list).

---

## 🎯 Objetivo

Automatizar la validación funcional y de contrato de los endpoints principales del sitio, usando `@playwright/test` como runner y `APIRequestContext` como cliente HTTP.

El diseño prioriza:

- **Tipado fuerte**: modelos TypeScript para requests y responses.
- **Arquitectura en capas**: Test → Service → API Client → Request.
- **Evidencia completa**: cada request y response se adjunta al reporte de Allure.
- **Bajo impacto**: uso responsable del sitio público (datos únicos, sin volumen alto de requests).

---

## 🧱 Stack

| Componente | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| Runner | Playwright Test (`@playwright/test`) |
| Reporter | Allure (`allure-playwright` + `allure-commandline`) |
| Runtime | Node.js 18+ |
| HTTP Client | `APIRequestContext` de Playwright |

---

## 📁 Estructura del proyecto

```
ae-qa-api-playwright/
├── src/
│   ├── models/               # Tipos de datos (User, Product, ApiResponse)
│   ├── clients/              # ApiClient (wrapper sobre APIRequestContext)
│   ├── services/             # Lógica de negocio (AccountService, ProductService)
│   ├── fixtures/             # Fixtures de Playwright (inyección de servicios)
│   └── utils/                # Helpers (assertApiSuccess, assertApiError)
├── tests/
│   ├── api-01-products-list.spec.ts
│   ├── api-07-verify-login.spec.ts
│   └── api-14-user-detail.spec.ts
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## ⚙️ Requisitos previos

- **Node.js** 18 o superior
- **npm** 9 o superior
- **Java 8+** (requerido por Allure para generar el reporte)

### Verificar versiones

```bash
node -v
npm -v
java -version
```

---

## 🚀 Instalación

```bash
git clone <url-del-repo>
cd ae-qa-api-playwright
npm install
```

---

## ▶️ Ejecución de las pruebas

### Correr todos los tests

```bash
npx playwright test
```

### Correr un test específico

```bash
npx playwright test tests/api-01-products-list.spec.ts
```

### Correr tests por nombre (grep)

```bash
npx playwright test -g "API 7"
```

### Ver la lista de tests sin ejecutarlos

```bash
npx playwright test --list
```

---

## 📊 Generar y ver el reporte de Allure

### Flujo completo (limpiar + correr + ver)

```bash
rm -rf allure-results allure-report test-results && npx playwright test && npx allure-commandline serve allure-results
```

### Paso a paso

```bash
# 1. Limpiar artefactos de corridas previas
rm -rf allure-results allure-report test-results

# 2. Ejecutar los tests (genera allure-results/)
npx playwright test

# 3. Generar y abrir el reporte HTML
npx allure-commandline serve allure-results
```

### Alternativa: generar y abrir por separado

```bash
# Solo generar el HTML
npx allure-commandline generate allure-results -o allure-report --clean

# Abrir el HTML ya generado
npx allure-commandline open allure-report
```

### Windows (PowerShell)

```powershell
Remove-Item -Recurse -Force allure-results, allure-report, test-results -ErrorAction SilentlyContinue
npx playwright test
npx allure-commandline serve allure-results
```

---

## 🧪 Casos de prueba

### API 1 — Get All Products List

**Endpoint**: `GET /api/productsList`

**Objetivo**: validar que el listado de productos devuelve datos válidos y con estructura consistente.

**Validaciones**:
- Código de negocio exitoso (`responseCode: 200`).
- El array `products` existe y no está vacío.
- Cada producto tiene los campos `id`, `name`, `price`, `brand` y `category`.
- La categoría contiene `usertype` y `category`.
- **Validación de consistencia**: todos los precios empiezan con el prefijo `Rs.`.
- Tiempo de respuesta reportado en Allure.

**Tags Allure**: `api`, `smoke`, `products`  
**Severidad**: critical

---

### API 7 — Verify Login with valid details

**Endpoint**: `POST /api/verifyLogin` con `{ email, password }`

**Objetivo**: validar que un usuario con credenciales válidas puede autenticarse correctamente.

**Validaciones**:
- Se crea un usuario único antes del test (setup).
- Código de negocio exitoso (`responseCode: 200`).
- El mensaje de respuesta contiene `"User exists"`.
- Cleanup garantizado: el usuario se elimina en `afterEach`, incluso si el test falla.
- Tiempo de respuesta reportado en Allure.

**Tags Allure**: `api`, `smoke`, `auth`  
**Severidad**: critical

**Nota técnica**: este endpoint **siempre devuelve HTTP 200**, incluso con credenciales inválidas. La diferencia real está en el `responseCode` del body:

| Caso | responseCode | message |
|---|---|---|
| Credenciales válidas | 200 | `"User exists!"` |
| Credenciales inválidas | 404 | `"User not found!"` |
| Faltan parámetros | 400 | `"Bad request..."` |

---

### API 14 — Get user account detail by email

**Endpoint**: `GET /api/getUserDetailByEmail?email=...`

**Objetivo**: validar que se puede consultar el detalle de una cuenta por email.

**Casos**:

1. **Caso positivo**: usuario existente.
   - Se crea un usuario único antes del test.
   - `responseCode: 200`.
   - El objeto `user` existe y los campos `email` y `name` coinciden con los enviados.
   - Cleanup en `afterEach`.

2. **Caso negativo**: email inexistente.
   - `responseCode: 404`.
   - El mensaje contiene `"not found"`.

**Tags Allure**: `api`, `smoke` / `regression`, `account`, `negative`  
**Severidad**: critical (positivo), normal (negativo)

---

## 🏗️ Arquitectura

### Capas

| Capa | Responsabilidad | Ejemplo |
|---|---|---|
| **Test** | Orquesta el flujo y valida resultados | `api-14-user-detail.spec.ts` |
| **Service** | Lógica de negocio sobre un recurso | `AccountService.createUser()` |
| **Client** | Wrapper HTTP (headers, attachments, enmascaramiento) | `ApiClient.post()` |
| **Request** | Playwright `APIRequestContext` | Inyectado por fixture |

### Fixtures

`src/fixtures/api.fixture.ts` extiende el `test` base de Playwright para inyectar automáticamente:

- `apiClient`: instancia de `ApiClient` con el `request` de Playwright.
- `accountService`: operaciones de cuenta (create, get, delete, verifyLogin).
- `productService`: operaciones de productos (getAll).

Los tests solo importan la fixture y reciben los servicios listos para usar:

```typescript
import { test, expect } from '../src/fixtures/api.fixture';

test('...', async ({ accountService, productService }) => {
  // usar los servicios
});
```

### Enmascaramiento de datos sensibles

`ApiClient` enmascara automáticamente los campos `password`, `token`, `api_key` y `authorization` antes de adjuntarlos a Allure, para evitar filtrar credenciales en el reporte.

### Aserciones centralizadas

`src/utils/assertApiResponse.ts` expone dos helpers:

- `assertApiSuccess(body, code = 200)`: valida respuesta exitosa.
- `assertApiError(body, code)`: valida respuesta de error con mensaje.

Ambos incluyen el `message` del body en el mensaje de fallo, facilitando el debug.

---

## 🔍 Decisiones técnicas

### ¿Por qué validar `body.responseCode` y no `response.status()`?

La API de `automationexercise.com` **siempre devuelve HTTP 200**, incluso en errores (404, 400, 201). El código de negocio real viene dentro del body en el campo `responseCode`. Por eso todas las aserciones se hacen sobre ese campo, no sobre el status HTTP.

### ¿Por qué `application/x-www-form-urlencoded`?

Los endpoints `POST` (createAccount, verifyLogin, etc.) esperan parámetros en formato form, no JSON. Playwright lo maneja con la opción `form:` de `request.post()`.

### ¿Por qué `DELETE` con query params?

El endpoint `deleteAccount` recibe los parámetros por **query string**, no por body:

```typescript
await client.delete('/api/deleteAccount', { email, password });
```

### ¿Por qué datos únicos por test?

El sitio es público y compartido. Si dos ejecuciones usan el mismo email, la segunda falla con "email already exists". Por eso cada test genera emails con `Date.now()`.

### ¿Por qué tiempos de respuesta informativos y no bloqueantes?

El sitio es público, sin SLA. Un umbral duro (ej. 3000ms) puede fallar por carga externa y hacer parecer que el código está roto. Los tiempos se reportan en Allure como adjuntos, sin romper el test.


## ⚠️ Consideraciones sobre el sitio bajo prueba

- Es un sitio **público y compartido** por la comunidad QA.
- Se usan **datos únicos por ejecución** (emails con timestamp).
- Se evita **volumen alto de requests**: `workers: 1`, sin paralelismo agresivo.
- Los tests asumen que el sitio está disponible; no se testea performance real ni carga.

---

## 📋 Resumen de comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npx playwright test` | Ejecuta todos los tests |
| `npx playwright test tests/<archivo>.spec.ts` | Ejecuta un archivo específico |
| `npx playwright test -g "API 7"` | Ejecuta tests que matcheen el nombre |
| `npx playwright test --list` | Lista tests sin ejecutar |
| `npx allure-commandline serve allure-results` | Genera y abre el reporte |
| `rm -rf allure-results allure-report test-results` | Limpia artefactos previos |

---