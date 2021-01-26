sap.ui.define(function() {

	"use strict";

	return {
		name: "Library 'sap.ui.mdc' - Testsuite Link",	/* Just for a nice title on the pages */
		defaults: {
			group: "Link",
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
				only:	"[sap/ui/mdc]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true,// Whether to call QUnit.start() when the test setup is done
			module: "./../{name}.qunit"
		},
		tests: {
			"link/Link": {
				title: "Link"
			},
			"link/LinkDelegate": {
				title: "LinkDelegate"
			},
			"link/Panel": {
				title: "Panel"
			},

			"field/FieldInfoBase": {
				title: "FieldInfoBase"
			},
			"field/FieldInfo": {
				title: "FieldInfo"
			},

			"link/FlpLinkDelegate": {
				title: "FlpLinkDelegate"
			},

			"link/opa/test/LinkPersonalization.opa": {
				title: "LinkPersonalization"
			},
			"link/opa/test/PersonalizationSelectionPanel00.opa": {
				title: "PersonalizationSelectionPanel00"
			},
			"link/opa/test/PersonalizationSelectionPanel01.opa": {
				title: "PersonalizationSelectionPanel01"
			},
			"link/opa/test/PersonalizationSelectionPanel02.opa": {
				title: "PersonalizationSelectionPanel02"
			},
			"link/opa/test/PersonalizationSelectionPanelEndUser.opa": {
				title: "PersonalizationSelectionPanelEndUser"
			},
			"link/opa/test/PersonalizationSelectionPanelKeyUser.opa": {
				title: "PersonalizationSelectionPanelKeyUser"
			},
			"link/opa/test/PersonalizationSelectionPanelRestore.opa": {
				title: "PersonalizationSelectionPanelRestore"
			},
			"link/opa/test/Link.opa": {
				title: "Link"
			}
		}
	};
});
