/*global module */
/*eslint strict: [2, "global"] */
"use strict";

module.exports = function (config) {

    config.set({
        basePath: '../../../', // from this file to main, so that from there access the unit under test
        frameworks: ['qunit', 'openui5'],
        ui5: { // UI5 runtime provisioning

        },
        client: { // UI5 bootstrap tag in karma
            ui5: {
                theme: 'sap_goldreflection',
                libs: [
                    "sap.ui.core"
                ]
            }
        },
        files: [
            // ----- UI5 ----------------------------------------
            '**/karma/bootstrapUI5.js', // UI5 path definition for "sap.apf" library (MANDATORY)

            // libs
            { pattern: 'test/uilib/libs/sinon-1.9.0.js', watched: false, included: true, served: true },

            // APF CORE sources
            { pattern: 'main/uilib/sap/apf/ui/representations/representationInterface.js', watched: true, included: true, served: true },
            { pattern: 'main/uilib/sap/apf/utils/*.js', 	included: false, watched: true},
            { pattern: 'main/uilib/sap/apf/core/utils/*.js', 	included: false, watched: true},
            { pattern: 'main/uilib/sap/apf/core/*.js', 	included: false, watched: true},
            { pattern: 'main/uilib/sap/apf/IfApfApi.js', 	included: false, watched: true},
            { pattern: 'main/uilib/sap/apf/Component.js', 	included: false, watched: true},
            { pattern: 'main/uilib/sap/apf/api.js', 	included: false, watched: true},
            // UI
            { pattern: 'main/uilib/sap/apf/ui/instance.js', 	included: false, watched: true},
            { pattern: 'main/uilib/sap/apf/ui/utils/*.js', 	included: false, watched: true},
            { pattern: 'main/uilib/sap/apf/ui/representations/*.js', 	included: false, watched: true},
            { pattern: 'main/uilib/sap/apf/ui/representations/utils/vizHelper.js', 	included: false, watched: true},
            { pattern: 'main/uilib/sap/apf/ui/**/*.js', 	included: false, watched: true},

            // test helper
            { pattern: 'test/uilib/helper/doubles/apfApi.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/doubles/annotation.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/doubles/binding.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/doubles/configurationFactory.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/doubles/coreApi.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/doubles/resourcePathHandler.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/doubles/messageHandler.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/doubles/metadata.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/doubles/representation.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/doubles/request.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/doubles/sessionHandler.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/doubles/sessionHandlerNew.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/doubles/step.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/mockHelper.js', watched: true, included: true, served: true },
            // test helper.doubles
            { pattern: 'test/uilib/helper/helper.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/config/sampleConfiguration.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/config/metadataConfig.js', watched: true, included: true, served: true },
            { pattern: 'test/uilib/helper/odata/sampleServiceData.js', watched: true, included: true, served: true },
            // test helper integration with doubles
            { pattern: 'test/uilib/integration/withDoubles/helper.js', watched: true, included: true, served: true },

            // MOCKSERVER
            { pattern:  '**/model/*.json', watched: true, included: false, served: true },
            { pattern:  '**/model/*.xml', watched: true, included: false, served: true },
            '**/model/tMockApf.qunit.js',
            '**/model/tMockServerFeatureTesting.qunit.js'
    //        '**/tMockHelper.qunit.js'
        ],
        exclude: [
        ],
        port: 9876,
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        // set environment variable CHROME_HOME or use absolute path to chrome.exe for property below
        // set env variable: CHROME_BIN = C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
        browsers: ['Chrome'],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress'],

        captureTimeout: 60000,
        autoWatch: true,
        singleRun: false
    });
};