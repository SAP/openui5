/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/testlibrary/table/Actions",
	"sap/ui/mdc/integration/testlibrary/table/Assertions"
], function(Opa5, TableActions, TableAssertions) {
	"use strict";

	Opa5.extendConfig({
		testLibBase: {
			mdcTestLibrary: {
				actions: TableActions,
				assertions: TableAssertions
			}
		}
	});
});
