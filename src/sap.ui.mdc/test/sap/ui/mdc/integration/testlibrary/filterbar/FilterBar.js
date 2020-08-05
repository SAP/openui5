/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/testlibrary/filterbar/Actions",
	"sap/ui/mdc/integration/testlibrary/filterbar/Assertions"
], function(
	Opa5,
	FilterBarActions,
	FilterBarAssertions
) {
	"use strict";

	Opa5.extendConfig({
		testLibBase: {
			mdcTestLibrary: {
				actions: FilterBarActions,
				assertions: FilterBarAssertions
			}
		}
	});
});
