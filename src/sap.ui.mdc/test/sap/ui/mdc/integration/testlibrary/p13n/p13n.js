/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/testlibrary/p13n/Actions",
	"sap/ui/mdc/integration/testlibrary/p13n/Assertions"
], function(
	Opa5,
	p13nActions,
	p13nAssertions
) {
	"use strict";

	Opa5.extendConfig({
		testLibBase: {
			mdcTestLibrary: {
				actions: p13nActions,
				assertions: p13nAssertions
			}
		}
	});
});
