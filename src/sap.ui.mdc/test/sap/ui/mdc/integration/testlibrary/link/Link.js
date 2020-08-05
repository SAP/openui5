/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/testlibrary/link/Actions",
	"sap/ui/mdc/integration/testlibrary/link/Assertions"
], function(Opa5, LinkActions, LinkAssertions) {
	"use strict";

	Opa5.extendConfig({
		testLibBase: {
			mdcTestLibrary: {
				actions: LinkActions,
				assertions: LinkAssertions
			}
		}
	});
});
