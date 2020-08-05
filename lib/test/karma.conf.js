/* eslint-env node */

module.exports = function(config) {
	"use strict";

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

		"sap.ui.mdc": "test/sap/ui/mdc/qunit/testsuite.qunit.html",

		"sap.ui.integration": "test/sap/ui/integration/qunit/testsuite.qunit.html",

		"sap.ui.layout": "test/sap/ui/layout/qunit/testsuite.qunit.html",

		"sap.ui.rta": "test/sap/ui/rta/qunit/testsuite.qunit.html",

		"sap.ui.suite": "test/sap/ui/suite/qunit/testsuite.qunit.html",

		"sap.ui.support": "test/sap/ui/support/qunit/testsuite.qunit.html",

		"sap.ui.table": "test/sap/ui/table/qunit/testsuite.qunit.html",

		"sap.ui.testrecorder": "test/sap/ui/testrecorder/qunit/testsuite.qunit.html",

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
		},
		//the failOnFailingTestSuite=false leads to UNSTABLE Jenkins build result, instead of FAILURE Jenkins build result
		failOnFailingTestSuite: false

	});

	// Run the server at http://localhost:8080
	// Using a framework plugin to ensure starting it before karma runs the tests
	config.plugins.push({
		"framework:testsuiteServer": ["factory", function() {
				return require("../server/testsuiteServer").start();
		}]
	});
	config.frameworks.push("testsuiteServer");

	if (config.lib === "sap.ui.core") {
		config.plugins.push({
			// When running tests for sap.ui.core we need to ensure that the version placeholder
			// within sap/ui/Global.js is replaced.
			// This is only required for sap.ui.core as karma will serve the project files directly
			// without the UI5 Server, so no replacement is done by default
			// TODO: This is just a workaround. Find a better solution...
			"preprocessor:sap.ui.core-replaceVersion": ["value", function (content, file, done) {
				done(content.replace(/\$\{version\}/g, require("../../package.json").version));
			}],
			// Also CSP headers are not set for HTML files of the current project
			// TODO: This is just a workaround. Find a better solution...
			"middleware:sap.ui.core-cspMiddleware": ["factory", function() {
				var cspMiddlewareFactory = require("@ui5/server").middlewareRepository.getMiddleware("csp").middleware;
				// Config copied from @ui5/server/lib/middleware/MiddlewareManager.js
				var cspMiddleware = cspMiddlewareFactory("sap-ui-xx-csp-policy", {
					allowDynamicPolicySelection: true,
					allowDynamicPolicyDefinition: true,
					definedPolicies: {
						"sap-target-level-1":
							"default-src 'self'; " +
							"script-src  'self' 'unsafe-eval'; " +
							"style-src   'self' 'unsafe-inline'; " +
							"font-src    'self' data:; " +
							"img-src     'self' https: http: data: blob:; " +
							"media-src   'self' https: http: data: blob:; " +
							"object-src  blob:; " +
							"frame-src   'self' https: gap: data: blob: mailto: tel:; " +
							"worker-src  'self' blob:; " +
							"child-src   'self' blob:; " +
							"connect-src 'self' https: wss:; " +
							"base-uri    'self';",
						"sap-target-level-2":
							"default-src 'self'; " +
							"script-src  'self'; " +
							"style-src   'self' 'unsafe-inline'; " +
							"font-src    'self' data:; " +
							"img-src     'self' https: http: data: blob:; " +
							"media-src   'self' https: http: data: blob:; " +
							"object-src  blob:; " +
							"frame-src   'self' https: gap: data: blob: mailto: tel:; " +
							"worker-src  'self' blob:; " +
							"child-src   'self' blob:; " +
							"connect-src 'self' https: wss:; " +
							"base-uri    'self';"
					}
				});
				return cspMiddleware;
			}]
		});
		config.set({
			preprocessors: {
				"src/sap/ui/Global.js": ["sap.ui.core-replaceVersion"]
			}
		});
		config.beforeMiddleware = config.beforeMiddleware || [];
		config.beforeMiddleware.push("sap.ui.core-cspMiddleware");
	}

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
		require("karma-ui5/helper").configureIframeCoverage(config);
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
