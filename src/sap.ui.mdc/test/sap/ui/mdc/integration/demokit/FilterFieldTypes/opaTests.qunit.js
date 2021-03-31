/*!
 * ${copyright}
 */

/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/testlibrary/MdcTestLibrary"
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
				viewName: "sap.ui.mdc.sample.FilterFieldTypes.View"
			}
		}
	});

	sap.ui.require([
		"sap/ui/mdc/test/sample/test/TestJourney"
	], function() {
		QUnit.start();
	});

});
