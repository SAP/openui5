sap.ui.define(function() {

	"use strict";

	return {
		name: "Package 'sap.ui.core.qunit.test.starter'",	/* Just for a nice title on the pages */
		defaults: {
			group: "Main",
			qunit: {
				version: 2					// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: 4					// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				libs: ["sap.ui.core"]		// Libraries to load upfront in addition to the library which is tested (sap.ui.table), if null no libs are loaded
			},
			coverage: {
				only: "[sap/ui/core]",		// Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"sap/ui/core/qunit": "test-resources/sap/ui/test/starter/"
				}
			}
		},
		tests: {
			"SimpleTestWithQUnit1": {
				module: './SimpleTest.qunit',
				qunit: {
					version: 1
				}
			},
			"SimpleTestWithQUnit2": {
				module: './SimpleTest.qunit',
				qunit: {
					version: 2
				}
			}
		}
	};

});