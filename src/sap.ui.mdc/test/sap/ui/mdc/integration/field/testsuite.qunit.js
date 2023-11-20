sap.ui.define(function() {

	"use strict";

	return {
		name: "Library 'sap.ui.mdc' - Integration Testsuite Field",	/* Just for a nice title on the pages */
		defaults: {
			qunit: {
				version: 2					// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: 4					// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false,					// Whether to run the tests in RTL mode
				libs: [
					"sap.ui.mdc",
					"sap.ui.fl"
				],		// Libraries to load upfront in addition to the library which is tested (sap.ui.mdc), if null no libs are loaded
				"xx-waitForTheme": true		// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only: "[sap/ui/mdc]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"testutils/opa": "test-resources/sap/ui/mdc/testutils/opa",
					"delegates": "test-resources/sap/ui/mdc/delegates",
					"sap/ui/mdc/integration/field": "test-resources/sap/ui/mdc/integration/field"
				}
			},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}"
		},
		tests: {
			"DateContents": {
				module: "./dateContent/opaTests.qunit"
			}
		}
	};
});
