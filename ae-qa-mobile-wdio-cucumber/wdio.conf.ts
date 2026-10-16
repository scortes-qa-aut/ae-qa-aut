import * as dotenv from 'dotenv';
import allureReporter from '@wdio/allure-reporter';
import { browser } from '@wdio/globals';

dotenv.config();

type CucumberHooks = WebdriverIO.Config & {
    afterStep?: (step: any, scenario: any, result: any) => Promise<void>;
    afterScenario?: (world: any, result: any) => Promise<void>;
};

if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
    throw new Error(
        '❌ Faltan credenciales de BrowserStack.\n' +
        'Completá BROWSERSTACK_USERNAME y BROWSERSTACK_ACCESS_KEY en el archivo .env\n' +
        'Las obtenés en: https://www.browserstack.com/accounts/settings'
    );
}

export const config: CucumberHooks = {
    runner: 'local',

    specs: ['./features/**/*.feature'],
    exclude: [],

    user: process.env.BROWSERSTACK_USERNAME,
    key: process.env.BROWSERSTACK_ACCESS_KEY,

    hostname: 'hub.browserstack.com',
    port: 443,
    protocol: 'https',
    path: '/wd/hub',

    maxInstances: 1,
    capabilities: [
        {
            platformName: 'Android',
            browserName: 'Chrome',
            'bstack:options': {
                deviceName: process.env.DEVICE_NAME || 'Google Pixel 7',
                platformVersion: process.env.PLATFORM_VERSION || '13.0',
                realMobile: true,
                projectName: process.env.BROWSERSTACK_PROJECT_NAME || 'AE QA Challenge',
                buildName: process.env.BROWSERSTACK_BUILD_NAME || 'Mobile Registration',
                sessionName: 'Registro de usuario',
                debug: true,
                networkLogs: true,
                consoleLogs: 'info',
                appiumVersion: '2.0.1',
            },
            'goog:chromeOptions': {
                args: ['--no-sandbox', '--disable-dev-shm-usage'],
            },
        } as any,
    ],

    logLevel: 'info',
    outputDir: './logs',
    bail: 0,

    baseUrl: process.env.BASE_URL || 'https://www.automationexercise.com',
    waitforTimeout: 20000,
    connectionRetryTimeout: 240000,
    connectionRetryCount: 2,

    services: [],

    framework: 'cucumber',
    cucumberOpts: {
        require: ['./features/step-definitions/**/*.ts'],
        requireModule: ['tsx/cjs'],
        backtrace: false,
        dryRun: false,
        failFast: false,
        snippets: true,
        source: true,
        strict: false,
        tagExpression: '',
        timeout: 300000,
        ignoreUndefinedDefinitions: false,
    },

    reporters: [
        ['spec', { addFileAttribute: true, showPreface: false }],
        ['allure', {
            outputDir: 'allure-results',
            disableWebdriverStepsReporting: false,
            disableWebdriverScreenshotsReporting: false,
            useCucumberStepReporter: true,
            reportedEnvironmentVars: {
                BaseURL: process.env.BASE_URL || 'https://www.automationexercise.com',
                Browser: 'Chrome Mobile',
                Platform: 'Android',
                Device: process.env.DEVICE_NAME || 'Google Pixel 7',
                Provider: 'BrowserStack',
                NodeVersion: process.version,
            },
        }],
    ],

    onPrepare: function () {
        console.log('🚀 Iniciando pruebas mobile en Chrome Android vía BrowserStack...');
        console.log(`   Device: ${process.env.DEVICE_NAME || 'Google Pixel 7'}`);
        console.log(`   Platform: Android ${process.env.PLATFORM_VERSION || '13.0'}`);
    },

    afterStep: async function (step: any, scenario: any, result: any) {
        const stepText = step?.text ?? 'paso sin descripción';
        const status = result?.error ? '❌' : '✅';

        try {
            const screenshot = await (browser as any).takeScreenshot();
            allureReporter.addAttachment(
                `Screenshot - ${stepText}`,
                Buffer.from(screenshot, 'base64'),
                'image/png'
            );
        } catch {
            // ignorar si falla el screenshot
        }

        allureReporter.addAttachment(
            `Log - ${stepText}`,
            `${status} ${stepText}`,
            'text/plain'
        );
    },

    afterScenario: async function (world: any, result: any) {
        if (result?.status === 'FAILED' || result?.failed) {
            try {
                const html = await (browser as any).getPageSource();
                allureReporter.addAttachment('HTML en fallo', html, 'text/html');
            } catch {
                // ignorar
            }
        }
    },

    onComplete: function () {
        console.log('✅ Mobile finalizado. Reporte: npx allure-commandline serve allure-results');
        console.log('📊 Dashboard BrowserStack: https://automate.browserstack.com/dashboard');
    },
};