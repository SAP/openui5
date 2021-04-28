/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/testlibrary/chartNew/Actions",
	"sap/ui/mdc/integration/testlibrary/chartNew/Assertions"
], function(
	Opa5,
	ChartActions,
	ChartAssertions
) {
	"use strict";

	Opa5.extendConfig({
		testLibBase: {
			mdcTestLibrary: {
				actions: ChartActions,
				assertions: ChartAssertions
			}
		}
	});
});
