sap.ui.define(["sap/ui/Device"], function (Device) {
	"use strict";

	return {
		name: "Library 'sap.m.p13n'", /* Just for a nice title on the pages */
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
				only: "[sap/m/p13n]", // Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true // Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"testutils/opa": "test-resources/sap/ui/mdc/testutils/opa"
				}
			},
			page: "test-resources/sap/m/qunit/p13n/smoke/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true, // Whether to call QUnit.start() when the test setup is done
			module: "./samples/{name}.qunit"
		},
		tests: {
			"Container": {
				group: "Demokit samples",
				sinon: false
			},
			"Engine": {
				group: "Demokit samples",
				sinon: false
			},
			"EngineCustomFilters": {
				group: "Demokit samples",
				sinon: false
			},
			"EngineGridList": {
				group: "Demokit samples",
				sinon: false
			},
			"EngineGridTable": {
				group: "Demokit samples",
				sinon: false
			},
			"EngineMultipleController": {
				group: "Demokit samples",
				sinon: false
			}
		}
	};
});
