/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/rta/api/startKeyUserAdaptation"
], function(Controller, startKeyUserAdaptation) {
	"use strict";

	var oController = Controller.extend("sap.ui.mdc.ActionToolbarTesting.controller.App", {
		onPressRTA: function() {
			var oOwnerComponent = this.getOwnerComponent();
			startKeyUserAdaptation({
				rootControl: oOwnerComponent.getAggregation("rootControl")
			});
		}
	});

	return oController;
});
