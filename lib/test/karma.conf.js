/* eslint-env node */

module.exports = function(config) {
	"use strict";

	// Run the server (http://localhost:8080)
	require("../server/testsuiteServer");

	// Entry testsuites of libraries
	var testpages = {

		"sap.f": "test/sap/f/qunit/testsuite.qunit.html",

		"sap.m": "test/sap/m/qunit/testsuite.mobile.qunit.html",
			// TODO: additional page: test/sap/m/qunit/testsuite.demoapps.qunit.html

		"sap.tnt": "test/sap/tnt/qunit/testsuite.demoapps.qunit.html",
			// TODO: additional page: test/sap/tnt/qunit/testsuite.mobile.qunit.html"

		"sap.ui.codeeditor": "test/sap/ui/codeeditor/qunit/testsuite.qunit.html",

		"sap.ui.commons": "test/sap/ui/commons/qunit/testsuite.qunit.html",

		"sap.ui.core": "test/sap/ui/core/qunit/testsuite.qunit.html",
			// TODO: additional page: test/sap/ui/core/qunit/testsuites/testsuite.demoapps.qunit.html

		"sap.ui.documentation": "test/sap/ui/documentation/sdk/qunit/testsuite.qunit.html",
			// TODO: additional page: "test/sap/ui/documentation/sdk/qunit/testsuite.demoapps.qunit.html"

		"sap.ui.dt": "test/sap/ui/dt/qunit/testsuite.qunit.html",

		"sap.ui.fl": "test/sap/ui/fl/qunit/testsuite.qunit.html",
		// TODO: additional page: "test/sap/ui/fl/testApps/controlPersonalizationAPI/test/testsuite.qunit.html"

		"sap.ui.integration": "test/sap/ui/integration/qunit/testsuite.qunit.html",

		"sap.ui.layout": "test/sap/ui/layout/qunit/testsuite.qunit.html",

		"sap.ui.rta": "test/sap/ui/rta/qunit/testsuite.qunit.html",

		"sap.ui.suite": "test/sap/ui/suite/qunit/testsuite.qunit.html",

		"sap.ui.support": "test/sap/ui/support/qunit/testsuite.qunit.html",
		"sap.ui.testrecorder": "test/sap/ui/testrecorder/testsuite.testrecorder.qunit.html",

		"sap.ui.table": "test/sap/ui/table/qunit/testsuite.qunit.html",

		"sap.ui.unified": "test/sap/ui/unified/qunit/testsuite.qunit.html",

		"sap.ui.ux3": "test/sap/ui/ux3/qunit/testsuite.qunit.html",

		"sap.uxap": "test/sap/uxap/qunit/testsuite.qunit.html"

	};

	var chromeFlags = [
		"--window-size=1280,1024"
	];

	config.set({

		basePath: "../../src/" + config.lib, // CLI arg, e.g.: --lib=sap.f

		frameworks: ["ui5"],

		ui5: {
			url: "http://localhost:8080",
			testpage: testpages[config.lib],
			urlParameters: [
				{
					key: "hidepassed",
					value: true
				}
			]
		},

		customLaunchers: {
			CustomChrome: {
				base: "Chrome",
				flags: chromeFlags
			},
			CustomChromeHeadless: {
				base: "ChromeHeadless",
				flags: chromeFlags
			}
		},

		browsers: ["CustomChrome"],

		browserDisconnectTolerance: 1,
		browserDisconnectTimeout: 300000,
		browserNoActivityTimeout: 300000,
		browserConsoleLogOptions: {
			level: "error"
		}

	});

	// CLI arg --coverage
	if (config.coverage) {
		config.set({
			preprocessors: {
				"src/**/*.js": ["coverage"]
			},

			reporters: config.reporters.concat(["coverage"]),

			coverageReporter: {
				includeAllSources: true,
				reporters: [
					{
						type: "html",
						dir: "coverage"
					},
					{
						type: "cobertura",
						dir: "coverage",
						file: "coverage.xml"
					},
					{
						type: "text-summary"
					}
				]
			}
		});
	}

	// CLI arg --ci
	if (config.ci) {
		config.set({
			browsers: ["CustomChromeHeadless"],
			singleRun: true,

			reporters: config.reporters.concat(["junit"]),

			// storing surefire report into subfolder surefire-reports, organized by browser name
			junitReporter: {
			  outputDir: "surefire-reports",
			  outputFile: "TEST-" + config.lib + ".xml",
			  suite: "",
			  useBrowserName: true,
			  nameFormatter: undefined,
			  classNameFormatter: undefined,
			  properties: {},
			  xmlVersion: null // use '1' if reporting to be per SonarQube 6.2 XML format
			}
		});
	}

};
