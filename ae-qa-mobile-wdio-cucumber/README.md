# AE QA Mobile E2E

Framework de automatización **Mobile** para [automationexercise.com](https://www.automationexercise.com) ejecutado sobre **Chrome en Android** vía **BrowserStack**.

---

## 🎯 Objetivo

Automatizar flujos de usuario en Chrome desde un dispositivo Android real, validando que el sitio funcione correctamente en viewport mobile.

El diseño prioriza:

- **Cero instalación local**: no requiere Android Studio, SDK ni Appium.
- **Dispositivo real**: BrowserStack provee hardware Android real, no emuladores.
- **Evidencia dual**: reporte Allure local + dashboard de BrowserStack con video.
- **Reutilización**: mismos Page Objects y steps que el proyecto web.

---

## 🧱 Stack

| Componente | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| Runner | WebdriverIO 9 |
| BDD | Cucumber (Gherkin) |
| Proveedor mobile | BrowserStack (App Automate) |
| Navegador | Chrome en Android |
| Reporter | Allure |
| Runtime | Node.js 18+ |

---

## 📁 Estructura

```
ae-qa-mobile-wdio-cucumber/
├── features/
│   ├── register.feature
│   ├── support/
│   │   └── state.ts
│   └── step-definitions/
│       ├── common.steps.ts
│       └── register.steps.ts
├── pageobjects/
│   └── RegisterPage.ts
├── utils/
│   └── browser.ts
├── .env.example
├── .env                (no commiteado)
├── .gitignore
├── wdio.conf.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## ⚙️ Requisitos previos

- **Node.js** 18 o superior
- **Java 8+** (requerido por Allure)
- **Cuenta en BrowserStack** con acceso a App Automate
- **Credenciales de BrowserStack** (username + access key)

### Obtener las credenciales

1. Ir a [browserstack.com/accounts/settings](https://www.browserstack.com/accounts/settings)
2. Copiar **Username** y **Access Key**
3. Completarlas en el archivo `.env`

---

## 🚀 Instalación

```bash
git clone <url-del-repo>
cd ae-qa-mobile-wdio-cucumber
npm install
cp .env.example .env
```

Después editá `.env` con tus credenciales reales:

```env
BROWSERSTACK_USERNAME=tu_username
BROWSERSTACK_ACCESS_KEY=tu_access_key
```

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

### Filtrar por tag

```bash
npx wdio run wdio.conf.ts --cucumberOpts.tagExpression="@smoke"
```

---

## 📊 Generar y ver el reporte de Allure

### Flujo completo

```bash
rm -rf allure-results allure-report && npx wdio run wdio.conf.ts && npx allure-commandline serve allure-results
```

### Paso a paso

```bash
# 1. Limpiar artefactos previos
rm -rf allure-results allure-report logs

# 2. Correr los tests
npx wdio run wdio.conf.ts

# 3. Generar y abrir el reporte
npx allure-commandline serve allure-results
```

---

## 📱 Dispositivos disponibles en BrowserStack

Configurá el dispositivo en `.env`:

```env
DEVICE_NAME=Google Pixel 7
PLATFORM_VERSION=13.0
```

Lista completa: [browserstack.com/list-of-browsers-and-platforms/app_automate](https://www.browserstack.com/list-of-browsers-and-platforms/app_automate)

Sugerencias para el plan gratuito:
- `Google Pixel 7` (Android 13)
- `Samsung Galaxy S23` (Android 13)
- `Google Pixel 6` (Android 12)

---

## 🎥 Dashboard de BrowserStack

Después de cada corrida, en [automate.browserstack.com/dashboard](https://automate.browserstack.com/dashboard):

- **Video completo** del test corriendo en el dispositivo real.
- **Logs de red** (requests HTTP).
- **Logs de Appium** (comandos enviados).
- **Screenshots automáticos** por comando.
- **Device info**: modelo, OS, versión de Chrome.

Esto complementa el reporte Allure local con evidencia nativa del dispositivo.

---

## 🧪 Caso de prueba

### Registro de usuario — `features/register.feature`

**Objetivo**: validar el flujo completo de registro en Chrome Android.

**Escenario**: `Registro exitoso con datos únicos desde Chrome Android`

**Pasos**:
1. **Given** el usuario navega al sitio.
2. **When** se registra un nuevo usuario con datos únicos.
3. **Then** la UI muestra la confirmación de cuenta creada.

**Particularidades mobile**:
- Pausas de 2 segundos post-navegación (latencia de red + renderizado mobile).
- `scrollIntoView()` antes de interactuar con el select de país y el botón de crear cuenta.
- Timeouts más altos (20-30s) por la latencia hacia BrowserStack.

**Tags**: `@smoke`, `@register`, `@mobile`

---

## 🔍 Decisiones técnicas

### ¿Por qué BrowserStack y no Appium local?

- Cero instalación local (no requiere Android Studio ni SDK).
- Dispositivos reales, no emuladores.
- Video y logs automáticos por sesión.
- Ideal para CI/CD.

### ¿Por qué `services: []`?

BrowserStack provee el servidor Appium **remoto**. El runner de WDIO se conecta directo al hub (`hub.browserstack.com`). No hace falta levantar Appium local.

### ¿Por qué timeouts tan altos?

Cada comando viaja a BrowserStack, se ejecuta en el dispositivo real, y vuelve. La latencia acumulada hace que un test que tarda 20s localmente tarde 1-2 minutos remoto.

### ¿Por qué las credenciales se validan al inicio?

`wdio.conf.ts` tira un error claro si faltan `BROWSERSTACK_USERNAME` o `BROWSERSTACK_ACCESS_KEY`. Así evitás perder minutos intentando conectar sin credenciales.

---

## ⚠️ Consideraciones

- **Sitio público compartido**: datos únicos por ejecución (timestamp en email).
- **Una sola instancia** (`maxInstances: 1`): BrowserStack cobra por sesión concurrente.
- **Minutos del plan**: cada corrida consume ~1-3 minutos. Usar `--spec` para correr solo lo necesario mientras se itera.

---

## 📋 Resumen de comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `cp .env.example .env` | Crea el .env desde la plantilla |
| `npx wdio run wdio.conf.ts` | Ejecuta todos los features |
| `npx wdio run wdio.conf.ts --spec features/register.feature` | Ejecuta un feature |
| `npx allure-commandline serve allure-results` | Genera y abre reporte |
| `rm -rf allure-results allure-report logs` | Limpia artefactos |