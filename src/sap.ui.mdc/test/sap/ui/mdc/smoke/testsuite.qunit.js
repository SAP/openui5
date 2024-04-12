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
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true, // Whether to call QUnit.start() when the test setup is done
			module: "./samples/{name}.qunit"
		},
		tests: {
			"LinkPayloadJson": {
				group: "Demokit samples",
				sinon: false
			},
			"FilterbarTypes": {
				group: "Demokit samples",
				sinon: false
			},
			"FilterbarCustomOperators": {
				group: "Demokit samples",
				sinon: false
			},
			"FilterbarCustomContent": {
				group: "Demokit samples",
				sinon: false
			},
			"TableJson": {
				group: "Demokit samples",
				sinon: false
			},
			"FieldTypes": {
				group: "Demokit samples",
				sinon: false
			},
			"FieldCustomContent": {
				group: "Demokit samples",
				sinon: false
			},
			"MultiValueField": {
				group: "Demokit samples",
				sinon: false
			}
		}
	};
});
