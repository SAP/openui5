sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/Text", // to have it loaded before rendering starts
	"delegates/odata/v4/FieldBaseDelegate", // to have it loaded before rendering starts
	"sap/ui/mdc/field/FieldMultiInput", // to have it loaded before rendering starts
	"sap/m/Token", // to have it loaded before rendering starts
	"sap/m/ExpandableText", // to have it loaded before rendering starts
	"sap/m/DynamicDateRange", // to have it loaded before rendering starts
	"sap/ui/mdc/condition/OperatorDynamicDateOption", // to have it loaded before rendering starts
	"sap/ui/mdc/field/DynamicDateRangeConditionsType" // to have it loaded before rendering starts
], function (Controller, UIComponent, Text, FieldBaseDelegate, FieldMultiInput, Token, ExpandableText, DynamicDateRange, OperatorDynamicDateOption, DynamicDateRangeConditionsType) {

	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.Authors", {

		onAddButtonPress: function (oEvent) {
			UIComponent.getRouterFor(this).navTo("authordetails", {
				authorId: "add"
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

			UIComponent.getRouterFor(this).navTo("authordetails", {
				authorId: oContext.getProperty("ID")
			});
		}

	});
});
