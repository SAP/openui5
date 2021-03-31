/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/testlibrary/field/Actions",
	"sap/ui/mdc/integration/testlibrary/field/Assertions"
], function(
	Opa5,
	FieldActions,
	FieldAssertions
) {
	"use strict";

	Opa5.extendConfig({
		testLibBase: {
			mdcTestLibrary: {
				actions: FieldActions,
				assertions: FieldAssertions
			}
		}
	});
});
