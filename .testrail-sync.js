/** 
 * cucumber-testrail-sync 
 * 
 * Usage:
 * ./node_modules/.bin/cucumber-testrail-sync --pull     
 * ./node_modules/.bin/cucumber-testrail-sync --push
 * 
 * [defaultValue: 'not provided', key: 'tr_domain', regexpFilter: '', value: '$.tr_domain'],
                    [defaultValue: 'not provided', key: 'tr_project_id', regexpFilter: '', value: '$.tr_project_id'],
                    [defaultValue: 'not provided', key: 'tr_suite_id', regexpFilter: '', value: '$.tr_suite_id'],
                    [defaultValue: 'not provided', key: 'tr_update_plan', regexpFilter: '', value: '$.tr_update_plan'],
 * 
 */
const keys = require('./src/configs/keys');


module.exports = {
    testrail: {
        host: keys.tr_domain || 'https://' + process.env.TR_DOMAIN,
        user: keys.tr_username || process.env.TR_USERNAME,
        password: keys.tr_apikey || process.env.TR_APIKEY, // password or api key
        filters: {
            plan_id: keys.tr_pan_id || process.env.TR_UPD_PLAN, // required: the project's plan id
            run_id: keys.tr_run_id || process.env.TR_RUN_NAME, // optional: a test run
            // if not set, all the runs in the plan will be included
            // custom_status: [6] // optional list of whitelisted status (testcases that don't have 1 of thoses statuses won't be synced)
            // 3 = Approved
            // 4 = Approved to automate
        },
    },
    featuresDir: "test_rails/sync_features",
    overwrite: {
        local: true, // 'ask' will show you the differences and force you to confirm before overwriting
        remote: true,

    },
    directoryStructure: {
        type: 'section:name',
        // skipRootFolder: 0
    },
    //Optional: default testcase attributes when pushing new testcases to TestRail
    newTestCase: {
        section_id: 51,
        template_id: 1,
        type_id: 1,
        priority_id: 3,
        estimate: 1,
        custom_status: 3
    }

};