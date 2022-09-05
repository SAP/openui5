sap.ui.define(function() {

	"use strict";

	return {
		name: "Library 'sap.ui.mdc' - Integration Testsuite Field Content",	/* Just for a nice title on the pages */
		defaults: {
			group: "Field Content",
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
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: false,
			module: "./{name}.qunit"
		},
		tests: {
			"DateContents": {
                module: "./DateContent/opaTests.qunit",
				loader: {
					paths: {
						"sap/ui/mdc/integration/Field/DateContent": "test-resources/sap/ui/mdc/integration/Field/DateContent",
						"testutils/opa": "test-resources/sap/ui/mdc/testutils/opa",
						"sap/ui/mdc/sample/field": "test-resources/sap/ui/mdc/sample/field",
						"delegates": "test-resources/sap/ui/mdc/delegates"
					}
				}
            }
		}
	};
});
