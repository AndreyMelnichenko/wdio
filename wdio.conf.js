const { addArgument } = require('@wdio/allure-reporter').default;
const TagExpressionParser = require('cucumber-tag-expressions').TagExpressionParser;
const tagParser = new TagExpressionParser();
const glob = require('glob');
const moment = require('moment');
const fs = require('fs');

const env = process.env.BASE_URL;
const env_domain = process.env.BASE_DOMAIN;
const env_ssl = process.env.SSl || 'https';
const comment = process.env.COMMIT_TITLE || 'Debug run ' + process.env.CUCUMBER_TAGS ;
const author = process.env.COMMIT_AUTHOR;
const revision = process.env.COMMIT_REV;
const deployedAt = process.env.DEPLOY_TIME || `${new moment(new Date()).format('HH:mm:ss DD-MM-YYYY')}`;

const testRailsOptions = {
    domain: process.env.TR_DOMAIN,
    username: process.env.TR_USERNAME,
    password: process.env.TR_APIKEY,
    projectId: process.env.TR_PROJECT_ID || '1',
    suiteId: process.env.TR_SUIT_ID,
    updatePlan: process.env.TR_UPD_PLAN,
    runName: process.env.TR_RUN_NAME,
    includeAll: process.env.TR_ALL || true,
    customStatuses: { "Passed": 1, "Failed": 6 },
    customDescription: `${process.env.TR_CUSTOM_DESCR}` || 'TR_CUSTOM_DESCR'
};

const cucumberTags = process.env.CUCUMBER_TAGS != null ? process.env.CUCUMBER_TAGS : '@debug';
const expressionNode = tagParser.parse(cucumberTags);
const filesWithTags = glob.sync('./features/**/*.feature').map((file) => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.length > 0) {
        const tagsInFile = content.match(/(@\w+)/g) || [];
        if (expressionNode.evaluate(tagsInFile)) {
            return file;
        }
    }
    return null;
}).filter(x => x != null);

const clearCookie = () => {
    try {
        browser.deleteAllCookies()
    } catch (error) {
        console.warn(`Unable to clear browser cache: \n${error}`);
    }
};
let scenarioCounter=0;
exports.config = {
    downloadDir: `${process.cwd()}/tmp`,
    hostname: process.env.ENV_HOST,
    path: '/wd/hub',
    port: 4444,
    specs: process.env.SPECS_PATH || filesWithTags,
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    maxInstances: 5,
    capabilities: [
        {
            maxInstances: 5,
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: [
                    // 'headless',
                    // 'no-sandbox',
                    // 'disable-gpu',
                    // 'disable-dev-shm-usage',
                    //'disable-software-rasterizer',
                    // 'mute-audio',
                    // 'disable-infobars',
                    // 'ignore-certificate-errors',
                    // 'disable-popup-blocking',
                    'disable-notifications',
                    'start-maximized'
                    // 'window-size=1280,720'
                ],
            },
            'selenoid:options': {
                enableVNC: true,
                sessionTimeout: '5m',
            }
        },
    ],

    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel: 'error',
    // in debug mode passes --inspect
    execArgv: [
        // '--inspect'
    ],
    bail: 0,
    baseUrl: "https://www.w3schools.com",
    deprecationWarnings: true,
    sync: true,
    coloredLogs: true,
    waitforTimeout: 10000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 5,
    services: ['selenium-standalone'],
    framework: 'cucumber',
    reporters: [
        'spec',
        [
            'allure',
            {
                outputDir: 'allure-results',
                disableWebdriverStepsReporting: true,
                disableWebdriverScreenshotsReporting: false,
                useCucumberStepReporter: true,
            },
        ],
    ],
    // If you are using Cucumber you need to specify the location of your step definitions.
    cucumberOpts: {
        backtrace: false, // <boolean> show full backtrace for errors
        dryRun: false, // <boolean> invoke formatters without executing steps
        failFast: false, // <boolean> abort the run on first failure
        format: ['pretty'], // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
        colors: true, // <boolean> disable colors in formatter output
        snippets: true, // <boolean> hide step definition snippets for pending steps
        source: true, // <boolean> hide source uris
        profile: [], // <string[]> (name) specify the profile to use
        strict: false, // <boolean> fail if there are any undefined or pending steps
        tagExpression: cucumberTags, // <string> (expression) only execute the features or scenarios with tags matching the expression
        timeout: 24 * 60 * 60 * 1000, // <number> timeout for step definitions
        ignoreUndefinedDefinitions: false, // <boolean> Enable this config to treat undefined definitions as warnings
        requireModule: [
            // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
            'tsconfig-paths/register',
            () => {
                require('ts-node').register(
                    {
                        files: true,
                    });
            },
            '@babel/register',
        ],
        require: [
            './src/fixtures/hooks.ts', // override default World constructor
            './src/step-definitions/*.steps.ts',
            './babel.config.js',
        ], // <string[]> (file/dir) require files before executing features
    },
    // =====
    // Hooks
    // =====
    /**
     * Gets executed once before all workers get launched.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    onPrepare: function (config, capabilities) {
        if (filesWithTags.length > 0) {
            console.log(`Files with tags:  ${filesWithTags}`);
        }
    },
    /**
     * Gets executed just before initialising the webdriver session and test framework. It allows you
     * to manipulate configurations depending on the capability or spec.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    // beforeSession: function (config, capabilities, specs) {
    // },
    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    before: () => {
        console.log(`
        +===========================================================
        | TEST-PACK START RUNNING: ${result[1].uri}
        +===========================================================
        | URL:            ${this.config.baseUrl}
        | SPECS:          ${filesWithTags}
        | TagExpression   ${this.config.cucumberOpts.tagExpression}
        +===========================================================
        `);
    },
    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    // beforeCommand: function (commandName, args) {
    // },
    /**
     * Runs before a Cucumber feature
     */
    // beforeFeature: function(uri, feature, scenarios) {
    // },
    /**
     * Runs before a Cucumber scenario
     */
    beforeScenario: function (uri, feature, scenario, sourceLocation) {
        clearCookie();
    },
    /**
     * Runs before a Cucumber step
     */
    // beforeStep: function (uri, feature, stepData, context) {
    // },
    /**
     * Runs after a Cucumber step
     */
    // afterStep: function (uri, feature, { error, result, duration, passed }, stepData, context) {
    // },
    afterStep: function(uri, feature, { error }) {
        if (error !== undefined) {
            browser.takeScreenshot();
        }
    },
    /**
     * Runs after a Cucumber scenario
     */
    afterScenario: function(uri, feature, scenario, result, sourceLocation) {
        clearCookie();
        scenarioCounter += 1;
        console.log("Report result to TestRail");
        console.log("add argument: "+scenarioCounter);
        addArgument('Scenario #', scenarioCounter);
        console.log("feature: "+feature.document.feature.name
            +" TC: "+scenario.tags[0].name
            +" "+ scenario.name
            +" result:"+result.status);
    },
    /**
     * Runs after a Cucumber feature
     */
    // afterFeature: function (uri, feature, scenarios) {
    // },
    afterTest: function(test) {
        // if (test.error !== undefined) {
        // browser.takeScreenshot();
        // }
        clearCookie();
    }
    /**
     * Runs after a WebdriverIO command gets executed
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     * @param {Number} result 0 - command success, 1 - command error
     * @param {Object} error error object if any
     */
    // afterCommand: function (commandName, args, result, error) {
    // },
    /**
     * Gets executed after all tests are done. You still have access to all global variables from
     * the test.
     * @param {Number} result 0 - test pass, 1 - test fail
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // after: function (result, capabilities, specs) {
    // },
    /**
     * Gets executed right after terminating the webdriver session.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // afterSession: function (config, capabilities, specs) {
    // },
    /**
     * Gets executed after all workers got shut down and the process is about to exit. An error
     * thrown in the onComplete hook will result in the test run failing.
     * @param {Object} exitCode 0 - success, 1 - fail
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {<Object>} results object containing test results
     */
    // onComplete: function(exitCode, config, capabilities, results) {
    // },
    /**
     * Gets executed when a refresh happens.
     * @param {String} oldSessionId session ID of the old session
     * @param {String} newSessionId session ID of the new session
     */
    //onReload: function(oldSessionId, newSessionId) {
    //}
};
