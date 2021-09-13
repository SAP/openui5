/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/testlibrary/valuehelp/Actions",
	"sap/ui/mdc/integration/testlibrary/valuehelp/Assertions"
], function(
	Opa5,
	ValueHelpActions,
	ValueHelpAssertions
) {
	"use strict";

	Opa5.extendConfig({
		testLibBase: {
			mdcTestLibrary: {
				actions: ValueHelpActions,
				assertions: ValueHelpAssertions
			}
		}
	});
});
