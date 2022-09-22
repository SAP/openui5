/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/field/dateContent/test/Journey",
    "testutils/opa/TestLibrary"
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
				viewName: "sap.ui.mdc.integration.field.dateContent.view.App"
			}
		}
	});

});
