/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/rta/api/startKeyUserAdaptation",
	"sap/ui/mdc/enums/ChartToolbarActionType",
	"sap/ui/core/Element"
], function(Controller, startKeyUserAdaptation, ChartToolbarActionType, Element) {
	"use strict";

	const oController = Controller.extend("sap.ui.mdc.ActionToolbarTesting.controller.App", {
		onPressRTA: function() {
			const oOwnerComponent = this.getOwnerComponent();
			startKeyUserAdaptation({
				rootControl: oOwnerComponent.getAggregation("rootControl")
			});
		},
		onInit: function() {
			const oOwnerComponent = this.getOwnerComponent();
			const oChart = Element.registry.get(oOwnerComponent.getId() + "---app--actionToolbarChart");

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
