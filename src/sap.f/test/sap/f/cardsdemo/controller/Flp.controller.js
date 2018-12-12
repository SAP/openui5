sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Flp", {
		onSwitchChange: function (oEvent) {

			var oGrid = this.getView().byId("cssgrid");
			var oLayout = oGrid.getCustomLayout();

			if (oEvent.getParameter("state")) {
				this.getView().byId("tile1").setSizeBehavior("Small");
				this.getView().byId("tile2").setSizeBehavior("Small");
				oLayout.setGridTemplateColumns("repeat(12, 4.25rem)");
				oLayout.setGridAutoRows("4.25rem");
				oLayout.setGridRowGap("0.75rem");
				oLayout.setGridColumnGap("0.75rem");
			} else {
				this.getView().byId("tile1").setSizeBehavior("Responsive");
				this.getView().byId("tile2").setSizeBehavior("Responsive");
				oLayout.setGridTemplateColumns("repeat(12, 5rem)");
				oLayout.setGridAutoRows("5rem");
				oLayout.setGridRowGap("1rem");
				oLayout.setGridColumnGap("1rem");
			}
		}
    });

});