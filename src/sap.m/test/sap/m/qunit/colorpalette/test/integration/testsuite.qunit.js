sap.ui.define(function() {

	"use strict";
	return {
		defaults: {
			name: "CalendarPalette Opa tests",	/* Just for a nice title on the pages */
			group: "",
			ui5: {
				libs: "",
				theme: "sap_belize",
				noConflict: true,
				preload: "auto",
				"xx-waitForTheme": true			// Whether the start of the test should be delayed until the theme is applied
			},
			qunit: {
				version: "edge",				// Whether QUnit should be loaded and if so, what version
				reorder: false
			},
			sinon: null,
			module: "./{name}",
			page: "test-resources/sap/m/qunit/colorpalette/test/integration/opaTest.qunit.html?test={name}",
			autostart: false					// Whether to call QUnit.start() when the test setup is done
		},
		tests: {
			ComplexJourney: {
				ui5: {
					resourceroots: {
						"cp.opa.test.app": "test-resources/sap/m/qunit/colorpalette/",
						"cp.opa.test.env": "test-resources/sap/m/qunit/colorpalette/test/",
						"cp.opa.test": "resources/sap/ui/"
					},
					frameOptions: "trusted"
				},
				coverage: {
					only: [
						"test-resources/sap/m/qunit/colorpalette/test/integration/ColorPalette",
						"test-resources/sap/m/qunit/colorpalette/test/integration/ColorPalettePopover"
					]
				}
			},
			ComplexJourney2: {
				ui5: {
					resourceroots: {
						"cp.opa.test.app": "test-resources/sap/m/qunit/colorpalette/",
						"cp.opa.test.env": "test-resources/sap/m/qunit/colorpalette/test/",
						"cp.opa.test": "resources/sap/ui/"
					},
					frameOptions: "trusted"
				},
				coverage: {
					only: [
						"test-resources/sap/m/qunit/colorpalette/test/integration/ColorPalette",
						"test-resources/sap/m/qunit/colorpalette/test/integration/ColorPalettePopover"
					]
				}
			}
		}
	};
});
