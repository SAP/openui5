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
				libs: [],
				"xx-waitForTheme": true // Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only: "[sap/ui/mdc]", // Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true // Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"delegates": "test-resources/sap/ui/mdc/delegates",
					"testutils/opa": "test-resources/sap/ui/mdc/testutils/opa"
				}
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
			"ListReportFLVM": {
				group: "TWFB",
				loader: {
					paths: {
						"mdc/qunit/util": "test-resources/sap/ui/mdc/qunit/util",
						"sap/ui/mdc/integration": "test-resources/sap/ui/mdc/integration",
						"sap/ui/v4demo": "test-resources/sap/ui/mdc/internal/TableWithFilterBar",
						"local" : "test-resources/sap/ui/mdc/integration/twfb"
					}
				},
				qunit: {
					reorder: false
				},
				autostart: false, // tests are added asynchronously because the V4 server needs to be found first
				module: "test-resources/sap/ui/mdc/integration/twfb/ListReportFLVM.qunit",
				sinon: false
			},
			"ListReportJourney": {
				group: "TWFB",
				loader: {
					paths: {
						"mdc/qunit/util": "test-resources/sap/ui/mdc/qunit/util",
						"sap/ui/mdc/integration": "test-resources/sap/ui/mdc/integration",
						"sap/ui/v4demo": "test-resources/sap/ui/mdc/internal/TableWithFilterBar",
						"local": "test-resources/sap/ui/mdc/integration/twfb",
						"delegates": "test-resources/sap/ui/mdc/delegates"
					}
				},
				qunit: {
					reorder: false
				},
				autostart: false, // tests are added asynchronously because the V4 server needs to be found first
				module: "test-resources/sap/ui/mdc/integration/twfb/ListReportJourney.qunit",
				sinon: false
			},
			"TestJourney": {
				group: "TWFB",
				loader: {
					paths: {
						"mdc/qunit/util": "test-resources/sap/ui/mdc/qunit/util",
						"sap/ui/mdc/integration": "test-resources/sap/ui/mdc/integration",
						"sap/ui/v4demo": "test-resources/sap/ui/mdc/internal/TableWithFilterBar",
						"local": "test-resources/sap/ui/mdc/integration/twfb"
					}
				},
				qunit: {
					reorder: false
				},
				autostart: false, // tests are added asynchronously because the V4 server needs to be found first
				module: "test-resources/sap/ui/mdc/integration/twfb/TestJourney.qunit",
				sinon: false
			},
			"SelectFromListJourney": {
				group: "ValueHelp",
				loader: {
					paths: {
						"mdc/qunit/util": "test-resources/sap/ui/mdc/qunit/util",
						"sap/ui/mdc/integration": "test-resources/sap/ui/mdc/integration",
						"sap/ui/v4demo": "test-resources/sap/ui/mdc/integration/valuehelp",
						"delegates": "test-resources/sap/ui/mdc/delegates"
					}
				},
				qunit: {
					reorder: false
				},
				autostart: false, // tests are added asynchronously because the V4 server needs to be found first
				module: "test-resources/sap/ui/mdc/integration/valuehelp/SelectFromListJourney.qunit",
				sinon: false
			},
			"DefineConditionsJourney": {
				group: "ValueHelp",
				loader: {
					paths: {
						"mdc/qunit/util": "test-resources/sap/ui/mdc/qunit/util",
						"sap/ui/mdc/integration": "test-resources/sap/ui/mdc/integration",
						"sap/ui/v4demo": "test-resources/sap/ui/mdc/integration/valuehelp",
						"delegates": "test-resources/sap/ui/mdc/delegates"
					}
				},
				qunit: {
					reorder: false
				},
				autostart: false, // tests are added asynchronously because the V4 server needs to be found first
				module: "test-resources/sap/ui/mdc/integration/valuehelp/DefineConditionsJourney.qunit",
				sinon: false
			},
			"ActionToolbar": {
				loader: {
					paths: {
						"sap/ui/mdc/ActionToolbarTesting": "test-resources/sap/ui/mdc/integration/actiontoolbar",
						"testutils/opa": "test-resources/sap/ui/mdc/testutils/opa"
					}
				},
				module: "test-resources/sap/ui/mdc/integration/actiontoolbar/opaTests.qunit",
				sinon: false
			},
			"Link": {
				loader: {
					paths: {
						"sap/ui/mdc/LinkIntegrationTesting": "test-resources/sap/ui/mdc/integration/link",
						"sap/ui/mdc/qunit/link/opa/test": "test-resources/sap/ui/mdc/qunit/link/opa/test"
					}
				},
				group: "PageObjects",
				module: "test-resources/sap/ui/mdc/integration/link/pageObject.qunit",
				sinon: false
			},
			"Field": {
				page: "test-resources/sap/ui/mdc/integration/Field/testsuite.qunit.html",
				sinon: false
			}
		}
	};
});
