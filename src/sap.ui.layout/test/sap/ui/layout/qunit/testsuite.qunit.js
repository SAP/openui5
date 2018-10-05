sap.ui.define(function() {

	"use strict";

	return {
		name: "Library 'sap.ui.layout'",	/* Just for a nice title on the pages */
		defaults: {
			group: "Library",
			qunit: {
				version: "edge"					// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: "edge"					// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false,					// Whether to run the tests in RTL mode
				libs: ["sap.ui.layout"],		// Libraries to load upfront in addition to the library which is tested (sap.ui.layout), if null no libs are loaded
				"xx-waitForTheme": true		// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only:	"[sap/ui/layout]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
				}
			},
			page: "test-resources/sap/ui/layout/qunit/testsandbox.qunit.html?test={name}",
			autostart: true					// Whether to call QUnit.start() when the test setup is done
		},
		tests: {
			"Grid": {
				coverage: {
					only : ["sap/ui/layout/Grid"]
				}
			},

			"ExploredSamples": {
				coverage: {
					only : ["sap/ui/layout/ExploredSamples"]
				},
				ui5: {
					libs: ["sap.ui.unified", "sap.ui.documentation", "sap.ui.layout", "sap.m"]
				},
				sinon: false,
				autostart: false
			},

			// Design Time
			"Designtime-Grid": {
				group: "Designtime",
				module: "./designtime/Grid.qunit",
				sinon: false
			},

			// CSSGrid
			"CSSGrid-CSSGrid": {
				group: "CSSGrid",
				module: "./cssgrid/CSSGrid.qunit",
				sinon: 1
			},

			"CSSGrid-GridTypes": {
				group: "CSSGrid",
				module: "./cssgrid/GridTypes.qunit",
				sinon: false
			}
		}
	};

});