sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/Text", // to have it loaded before rendering starts
	"delegates/odata/v4/FieldBaseDelegate", // to have it loaded before rendering starts
	"sap/ui/mdc/field/FieldMultiInput", // to have it loaded before rendering starts
	"sap/m/Token" // to have it loaded before rendering starts
], function(Controller, UIComponent, Text, FieldBaseDelegate, FieldMultiInput, Token) {
	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.Orders", {

		onAddButtonPress: function (oEvent) {
			UIComponent.getRouterFor(this).navTo("orderdetails", {
				orderId: "add"
			});
		},

		onFiltersChanged: function(oEvent) {
			var oText = this.getView().byId("statusTextExpanded");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersTextExpanded);
			}

			oText = this.getView().byId("statusTextCollapsed");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersText);
			}
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
