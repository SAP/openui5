sap.ui.define(function() {

	"use strict";

	return {
		name: "Library 'sap.ui.unified'",	/* Just for a nice title on the pages */
		defaults: {
			group: "Library",
			qunit: {
				version: 2					// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: 1					// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false,					// Whether to run the tests in RTL mode
				libs: ["sap.ui.unified"],		// Libraries to load upfront in addition to the library which is tested (sap.ui.unified), if null no libs are loaded
				"xx-waitForTheme": true		// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only:	"[sap/ui/unified]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
				}
			},
			page: "test-resources/sap/ui/unified/qunit/teststarter.qunit.html?test={name}",
			autostart: true					// Whether to call QUnit.start() when the test setup is done
		},
		tests: {
			"Shell": {
				group: "Shell"
			},
			"ShellLayout": {
				group: "Shell"
			},
			"ShellOverlay": {
				group: "Shell"
			},
			"SplitContainer": {
				group: "Shell"
			},

			"ExploredSamples": {
				ui5: {
					libs: ["sap.ui.unified", "sap.ui.documentation", "sap.ui.layout", "sap.m"]
				},
				sinon: false,
				autostart: false
			},

			// Design Time & RTA Enabling
			"Designtime-Library": {
				group: "Designtime",
				module: "./designtime/Library.qunit",
				qunit: {
					version: 1
				},
				autostart: false
			}
		}
	};

});