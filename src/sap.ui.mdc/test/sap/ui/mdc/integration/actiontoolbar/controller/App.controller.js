/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/rta/api/startKeyUserAdaptation",
	"sap/ui/mdc/enums/ChartToolbarActionType"
], function(Controller, startKeyUserAdaptation, ChartToolbarActionType) {
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
				ChartToolbarActionType.ZoomInOut,
				ChartToolbarActionType.DrillDownUp,
				ChartToolbarActionType.Legend,
				ChartToolbarActionType.FullScreen
			]);
		}
	});

	return oController;
});
