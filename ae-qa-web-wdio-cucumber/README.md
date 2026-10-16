# AE QA Web E2E

Framework de automatización **Web E2E** para [automationexercise.com](https://www.automationexercise.com).

---

## 🎯 Objetivo

Automatizar flujos de usuario sobre el sitio público, cubriendo la interacción del navegador con un framework mantenible, tipado y con reportes profesionales.

El diseño prioriza:

- **Legibilidad**: escenarios en Gherkin comprensibles para cualquier stakeholder.
- **Reutilización**: features por dominio y steps atómicos.
- **Mantenibilidad**: Page Object Model.
- **Evidencia completa**: reportes Allure con screenshots y logs en cada paso.
- **Bajo impacto**: uso responsable del sitio público (datos únicos, sin volumen alto de requests).

---

## 🧱 Stack

| Componente | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| Runner | WebdriverIO 9 |
| BDD | Cucumber (Gherkin) |
| Reporter | Allure |
| Runtime | Node.js 18+ |
| Navegador | Chrome (headless configurable) |
| Compilador TS | `tsx` |

---

## 📁 Estructura del proyecto

```
ae-qa-web-wdio-cucumber/
├── features/                          # Escenarios Gherkin
│   ├── register.feature               # Registro de usuario
│   └── step-definitions/
│       ├── common.steps.ts            # Steps transversales (navegación)
│       └── register.steps.ts          # Steps de registro
├── features/support/
│   └── state.ts                       # Estado compartido entre steps
├── pageobjects/
│   └── RegisterPage.ts                # Page Object del registro
├── utils/
│   └── browser.ts                     # Helper con tipos amplios de browser
├── logs/                              # Logs de ejecución (ignorado en git)
├── allure-results/                    # Resultados de Allure (ignorado en git)
├── allure-report/                     # Reporte HTML generado (ignorado en git)
├── wdio.conf.ts                       # Configuración de WDIO
├── tsconfig.json
├── package.json
└── README.md
```

---

## ⚙️ Requisitos previos

- **Node.js** 18 o superior
- **npm** 9 o superior
- **Google Chrome** instalado
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
cd ae-qa-web-wdio-cucumber
npm install
```

El `npm install` descarga WebdriverIO, Cucumber, el reporter de Allure y `tsx` como compilador TypeScript.

---

## ▶️ Ejecución de las pruebas

### Correr todos los features

```bash
npx wdio run wdio.conf.ts
```

### Correr un feature específico

```bash
npx wdio run wdio.conf.ts --spec features/register.feature
```

### Correr con filtro por tag (ej: solo smoke)

```bash
npx wdio run wdio.conf.ts --cucumberOpts.tagExpression="@smoke"
```

### Correr en modo headless (sin abrir Chrome)

En `wdio.conf.ts`, dentro de `capabilities`, descomentá las líneas:

```typescript
'--headless',
'--disable-gpu',
```

---

## 📊 Generar y ver el reporte de Allure

### Flujo completo (limpiar + correr + ver)

```bash
rm -rf allure-results allure-report && npx wdio run wdio.conf.ts && npx allure-commandline serve allure-results
```

### Paso a paso

```bash
# 1. Limpiar artefactos previos
rm -rf allure-results allure-report logs

# 2. Correr los tests (genera allure-results/)
npx wdio run wdio.conf.ts

# 3. Generar y abrir el reporte
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
Remove-Item -Recurse -Force allure-results, allure-report, logs -ErrorAction SilentlyContinue
npx wdio run wdio.conf.ts
npx allure-commandline serve allure-results
```

---

## 🧪 Casos de prueba

### Registro de usuario — `features/register.feature`

**Objetivo**: validar el flujo completo de registro de un usuario nuevo con datos únicos.

**Escenario**: `Registro exitoso con datos únicos`

**Pasos**:
1. **Given** el usuario navega al sitio de Automation Exercise.
2. **When** se registra un nuevo usuario con datos únicos.
3. **Then** la UI muestra la confirmación de cuenta creada.

**Validaciones**:
- El formulario de signup acepta nombre y email.
- El formulario completo acepta password, datos personales y dirección.
- Se muestra el header "Account Created!" tras enviar.

**Tags**: `@smoke`, `@register`  
**Severidad**: critical

---

## 🏗️ Arquitectura

### Capas

| Capa | Responsabilidad | Ejemplo |
|---|---|---|
| **Feature** | Escenario en Gherkin | `register.feature` |
| **Step** | Implementación de cada paso | `register.steps.ts` |
| **Page Object** | Encapsula selectores y acciones de una página | `RegisterPage.ts` |
| **State** | Datos compartidos entre steps | `state.ts` |
| **Utils** | Helpers transversales | `browser.ts` |

### Page Object Model

Cada página del sitio se encapsula en una clase con:
- **Getters** para los selectores.
- **Métodos** para las acciones (startSignup, completeForm, isAccountCreated).
- **Sin lógica de aserción**: eso vive en los steps.

### Estado compartido

`features/support/state.ts` es un módulo que guarda datos entre steps:

```typescript
export const state = {
  registeredName: '',
  registeredEmail: '',
  registeredPassword: '',
};
```

El step de registro guarda ahí el email y password generados, y los steps posteriores los consultan.

### Helper de browser

`utils/browser.ts` reexporta `browser` con tipo amplio para evitar conflictos con los tipos incompletos de WDIO 9:

```typescript
import { browser as wdioBrowser } from '@wdio/globals';
export const browser = wdioBrowser as any;
```

Si WDIO arregla los tipos en el futuro, solo hay que modificar este archivo.

---

## 📸 Evidencia en el reporte

Cada step del escenario genera automáticamente:

- **Screenshot** del navegador en ese momento.
- **Log textual** con el nombre del step y su estado (`✅` o `❌`).

Si un scenario falla, además se adjunta:

- **HTML completo** de la página en el momento del fallo.
- **Mensaje de error** detallado.

Todo se ve en el reporte de Allure, en la vista **Behaviors** → expandir Feature → Scenario → Steps.

---

## 🔍 Decisiones técnicas

### ¿Por qué `tsx` y no `ts-node`?

WebdriverIO 9 migró a `tsx` como compilador por defecto. El `autoCompileOpts` con `tsNodeOpts` de WDIO 8 ya no existe. `tsx` está en las `devDependencies` y WDIO lo detecta automáticamente.

### ¿Por qué `requireModule: ['tsx/cjs']` en `cucumberOpts`?

Cucumber tiene su propio loader independiente del de WDIO. Sin esa opción, Cucumber intenta cargar los `.steps.ts` con Node puro y falla silenciosamente mostrando `Step is not defined`. `tsx/cjs` le dice a Cucumber cómo cargar archivos TypeScript.

### ¿Por qué `utils/browser.ts` con `as any`?

El tipo `Browser` que exporta `@wdio/globals` en WDIO 9 no declara métodos estándar como `url`, `maximizeWindow`, `takeScreenshot` o `getPageSource`. Existen en runtime, pero no en el tipo. Centralizar el cast en un helper evita repetirlo en cada archivo.

### ¿Por qué datos únicos por test?

El sitio es público y compartido. Si dos ejecuciones usan el mismo email, la segunda falla con "email already exists". Por eso cada test genera emails con `Date.now()`.

### ¿Por qué Chrome visible por defecto?

Para que las pruebas sean demostrables y el desarrollador vea qué está pasando. En CI se descomentan `--headless` y `--disable-gpu`.

---

## ⚠️ Consideraciones sobre el sitio bajo prueba

- Es un sitio **público y compartido** por la comunidad QA.
- Se usan **datos únicos por ejecución** (emails con timestamp).
- Se evita **volumen alto de requests**: `maxInstances: 1`, sin paralelismo.
- Los tests asumen que el sitio está disponible; no se testea performance ni carga.

---

## 📋 Resumen de comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npx wdio run wdio.conf.ts` | Ejecuta todos los features |
| `npx wdio run wdio.conf.ts --spec features/register.feature` | Ejecuta un feature específico |
| `npx wdio run wdio.conf.ts --cucumberOpts.tagExpression="@smoke"` | Filtra por tag |
| `npx allure-commandline serve allure-results` | Genera y abre el reporte |
| `npx allure-commandline generate allure-results -o allure-report --clean` | Solo genera el HTML |
| `npx allure-commandline open allure-report` | Abre el HTML generado |
| `rm -rf allure-results allure-report logs` | Limpia artefactos previos |
| `npx tsc --noEmit` | Verifica tipos sin compilar |

---

## 🚦 Próximos pasos

- [x] Registro de usuario (UI)
- [ ] Login
- [ ] Búsqueda de productos
- [ ] Carrito
- [ ] Checkout
- [ ] Integración UI + API en un mismo escenario
- [ ] Flujo E2E completo