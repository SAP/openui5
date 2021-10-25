/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/testlibrary/chartNew/ActionsViz",
	"sap/ui/mdc/integration/testlibrary/chartNew/AssertionsViz"
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
