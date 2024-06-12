sap.ui.define(['../util/EnvHelper', "sap/base/util/merge"], function(EnvHelper, merge) {

	"use strict";

	const mConfig = {
		name: "Library 'sap.ui.mdc' - Testsuite Chart",	/* Just for a nice title on the pages */
		defaults: {
			group: "Chart",
			qunit: {
				version: 2					// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: 4					// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false,					// Whether to run the tests in RTL mode
				libs: ["sap.ui.mdc"],		// Libraries to load upfront in addition to the library which is tested (sap.ui.mdc), if null no libs are loaded
				"xx-waitForTheme": true		// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only: "[sap/ui/mdc]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
				never: "[sap/ui/mdc/qunit]",
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"delegates": "test-resources/sap/ui/mdc/delegates"
				}
			},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true
		},
		tests: {
			"Condenser": {
				sinon: false
			},
			"Chart": {
				module: "./Chart.qunit",
				/*coverage: {
						only: "[sap/ui/mdc/chart]"
				},*/
				sinon: {
					qunitBridge: true
				}
			},
			"ChartFlex": {
				module: "./ChartFlex.qunit",
				sinon: {
					qunitBridge: true
				},
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"Breadcrumbs": {
				module: "./ChartBreadcrumbs.qunit",
				/*coverage: {
						only: "[sap/ui/mdc/chart]"
				},*/
				sinon: {
					qunitBridge: true
				}
			},
			"Toolbar": {
				module: "./ChartToolbar.qunit",
				sinon: {
					qunitBridge: true
				}
			},
			"ChartImplementationContainer": {
				module: "./ChartImplementationContainer.qunit",
				sinon: {
					qunitBridge: true
				}
			},
			"V4 Chart Delegate": {
				module: "./ChartV4Delegate.qunit",
				sinon: {
					qunitBridge: true
				}
			},
			"OPA Test: Basic Tests": {
				autostart: false,
				module: "./OpaTests/basicValidation/TestStarter.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"ChartSelectionDetails": {
				module: "./ChartSelectionDetails.qunit",
				sinon: {
					qunitBridge: true
				}
			}
		}
	};
	return mConfig;
});
