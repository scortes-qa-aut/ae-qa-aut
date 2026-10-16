import * as dotenv from 'dotenv';
import allureReporter from '@wdio/allure-reporter';
import { browser } from '@wdio/globals';

dotenv.config();

type CucumberHooks = WebdriverIO.Config & {
    afterStep?: (step: any, scenario: any, result: any) => Promise<void>;
    afterScenario?: (world: any, result: any) => Promise<void>;
};

export const config: CucumberHooks = {
    // ============================================
    // RUNNER
    // ============================================
    runner: 'local',

    // ============================================
    // SPECS
    // ============================================
    specs: ['./features/**/*.feature'],
    exclude: [],

    // ============================================
    // CAPABILITIES (Chrome)
    // ============================================
    maxInstances: 1,
    capabilities: [
        {
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: [
                    // '--headless',
                    // '--disable-gpu',
                    '--window-size=1920,1080',
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                ],
            },
        },
    ],

    // ============================================
    // LOG LEVEL
    // ============================================
    logLevel: 'info',
    outputDir: './logs',
    bail: 0,

    // ============================================
    // BASE URL Y TIMEOUTS
    // ============================================
    baseUrl: process.env.BASE_URL || 'https://www.automationexercise.com',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 2,

    // ============================================
    // SERVICES
    // ============================================
    services: [],

    // ============================================
    // FRAMEWORK: CUCUMBER
    // ============================================
    framework: 'cucumber',
    cucumberOpts: {
        require: ['./features/step-definitions/**/*.ts'],
        backtrace: false,
        requireModule: [],
        dryRun: false,
        failFast: false,
        snippets: true,
        source: true,
        strict: false,
        tagExpression: '',
        timeout: 90000,
        ignoreUndefinedDefinitions: false,
    },

    // ============================================
    // REPORTERS: ALLURE
    // ============================================
    reporters: [
        ['spec', {
            addFileAttribute: true,
            showPreface: false,
        }],
        ['allure', {
            outputDir: 'allure-results',
            disableWebdriverStepsReporting: false,
            disableWebdriverScreenshotsReporting: false,
            useCucumberStepReporter: true,
            reportedEnvironmentVars: {
                BaseURL: process.env.BASE_URL || 'https://www.automationexercise.com',
                Browser: 'Chrome',
                NodeVersion: process.version,
            },
        }],
    ],

    // ============================================
    // HOOKS
    // ============================================
    onPrepare: function () {
        console.log('🚀 Iniciando ejecución de pruebas...');
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
        console.log('✅ Ejecución finalizada. Reporte: npx allure-commandline serve allure-results');
    },
};