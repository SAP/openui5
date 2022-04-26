/*!
 * ${copyright}
 */

/* global QUnit */
// QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function(
	Opa5
) {
	"use strict";

	Opa5.extendConfig({
		autoWait: true,
		async: true,
		appParams: {
			"sap-ui-animation": false
		},
		testLibs: {
			mdcTestLibrary: {
			// 	viewName: "sap.ui.mdc.sample.FieldEditMode.View"
			}
		}
	});

	sap.ui.require([
		"local/test/TestJourney"
	], function() {
		QUnit.start();
	});

});
