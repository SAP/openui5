sap.ui.define(["sap/ui/Device"], function (Device) {
	"use strict";

	return {
		name: "Library 'sap.ui.mdc'", /* Just for a nice title on the pages */
		defaults: {
			group: "Library",
			qunit: {
				version: 2 // Whether QUnit should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false, // Whether to run the tests in RTL mode
				libs: [
				],
				"xx-waitForTheme": true // Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only: "[sap/ui/mdc]", // Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true // Whether to enable standard branch coverage
			},
			page: "test-resources/sap/ui/mdc/integration/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true, // Whether to call QUnit.start() when the test setup is done
			module: "./{name}.qunit"
		},
		tests: {
			"V4ServerIntegration": {
				loader: {
					paths: {
						"mdc/qunit/util": "test-resources/sap/ui/mdc/qunit/util",
						"v4server/integration": "test-resources/sap/ui/mdc/integration/v4server"
					}
				},
				qunit: {
					reorder: false
				},
				autostart: false, // tests are added asynchronously because the V4 server needs to be found first
				module: "./v4server/V4ServerIntegration.qunit",
				sinon: false
			},

			"ListReportOPATests": {
				loader: {
					paths: {
						"mdc/qunit/util": "test-resources/sap/ui/mdc/qunit/util",
						"sap/ui/mdc/integration": "test-resources/sap/ui/mdc/integration",
						"sap/ui/v4demo": "test-resources/sap/ui/mdc/integration/ListReport",
						"delegates": "test-resources/sap/ui/mdc/delegates"
					}
				},
				qunit: {
					reorder: false
				},
				autostart: false, // tests are added asynchronously because the V4 server needs to be found first
				module: "test-resources/sap/ui/mdc/integration/ListReport/opaTests.qunit",
				sinon: false
			}
		}
	};
});
