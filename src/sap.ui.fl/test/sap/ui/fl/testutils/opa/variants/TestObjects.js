/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"./Actions",
	"./Assertions"
], function(
	Opa5,
	Actions,
	Assertions
) {
	"use strict";

	Opa5.createPageObjects({
		onFlVariantManagement: {
			actions: Actions,
			assertions: Assertions
		}
	});
});
