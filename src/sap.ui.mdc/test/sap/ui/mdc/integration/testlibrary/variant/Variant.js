/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/testlibrary/variant/Actions",
	"sap/ui/mdc/integration/testlibrary/variant/Assertions"
], function(
	Opa5,
	VariantActions,
	VariantAssertions
) {
	"use strict";

	Opa5.extendConfig({
		testLibBase: {
			mdcTestLibrary: {
				actions: VariantActions,
				assertions: VariantAssertions
			}
		}
	});
});
