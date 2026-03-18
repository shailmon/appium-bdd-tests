import capabilities from './capabilities.json';

export const config: WebdriverIO.Config = {
    // Set execution properties
    runner: 'local',
    
    // Connect to Appium server managed by WDIO
    port: 4723,
    path: '/',

    // Spec patterns
    specs: [
        '../features/**/*.feature'
    ],
    exclude: [],

    // Capabilities
    maxInstances: 1,
    capabilities: [capabilities.android],

    // Log & timeouts
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    // Services
    services: [
        ['appium', {
            args: {
                address: '127.0.0.1',
                port: 4723,
                relaxedSecurity: true
            },
            logPath: './'
        }]
    ],

    // Framework
    framework: 'cucumber',
    reporters: [
        'spec',
        ['allure', {
            outputDir: 'reports/allure-results',
            disableWebdriverStepsReporting: true,
            disableWebdriverScreenshotsReporting: false,
        }]
    ],

    // Cucumber configuration
    cucumberOpts: {
        require: [
            './step-definitions/**/*.ts',
            './support/hooks.ts'
        ],
        backtrace: false,
        requireModule: [],
        dryRun: false,
        failFast: false,
        format: ['pretty'],
        snippets: true,
        source: true,
        profile: [],
        strict: false,
        tagExpression: '',
        timeout: 60000,
        ignoreUndefinedDefinitions: false
    }
};
