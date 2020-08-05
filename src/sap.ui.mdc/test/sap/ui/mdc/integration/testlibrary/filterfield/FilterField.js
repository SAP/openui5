/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/testlibrary/filterfield/Actions",
	"sap/ui/mdc/integration/testlibrary/filterfield/Assertions"
], function(
	Opa5,
	FilterFieldActions,
	FilterFieldAssertions
) {
	"use strict";

	Opa5.extendConfig({
		testLibBase: {
			mdcTestLibrary: {
				actions: FilterFieldActions,
				assertions: FilterFieldAssertions
			}
		}
	});
});
