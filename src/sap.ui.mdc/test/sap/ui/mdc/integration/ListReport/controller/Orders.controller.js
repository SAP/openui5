/*!
 * ${copyright}
 */

 sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"
], function(Controller, UIComponent) {
	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.Orders", {

		onAddButtonPress: function (oEvent) {
			UIComponent.getRouterFor(this).navTo("orderdetails", {
				orderId: "add"
			});
		},

		onRowPress: function (oEvent) {
			var oContext = oEvent.getParameter("bindingContext") || oEvent.getSource().getBindingContext();

			UIComponent.getRouterFor(this).navTo("orderdetails", {
				orderId: oContext.getProperty("ID")
			});
		},

		onSearch: function (oEvent) {
			// Prepare for ConditionModel listBinding removal
			/* var oListBinding = this.getView().byId("ordersTable").getBinding("items");

			if (oListBinding) {
				var oFilterBar = oEvent.getSource(),
					mConditions = oEvent.getParameter("conditions"),
					oFilters = oFilterBar.getFilters();

				if (oListBinding.changeParameters) {
					oListBinding.changeParameters({ $search: mConditions.$search && mConditions.$search[0].values[0] });
				}

				oListBinding.filter(oFilters);
			}
			*/
		}
	});
});
