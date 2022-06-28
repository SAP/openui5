/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/rta/api/startKeyUserAdaptation",
	"sap/ui/mdc/library"
], function(Controller, startKeyUserAdaptation, MDCLib) {
	"use strict";

	var oController = Controller.extend("sap.ui.mdc.ActionToolbarTesting.controller.App", {
		onPressRTA: function() {
			var oOwnerComponent = this.getOwnerComponent();
			startKeyUserAdaptation({
				rootControl: oOwnerComponent.getAggregation("rootControl")
			});
		},
		onInit: function() {
			var oOwnerComponent = this.getOwnerComponent();
			var oChart = sap.ui.getCore().byId(oOwnerComponent.getId() + "---app--actionToolbarChart");

			oChart.setIgnoreToolbarActions([
				MDCLib.ChartToolbarActionType.ZoomInOut,
				MDCLib.ChartToolbarActionType.DrillDownUp,
				MDCLib.ChartToolbarActionType.Legend,
				MDCLib.ChartToolbarActionType.FullScreen
			]);
		}
	});

	return oController;
});
