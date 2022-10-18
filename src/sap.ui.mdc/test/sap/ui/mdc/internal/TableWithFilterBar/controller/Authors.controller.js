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
	"sap/ui/mdc/field/DynamicDateRangeConditionsType", // to have it loaded before rendering starts
	"sap/ui/mdc/condition/FilterOperatorUtil"
], function (Controller, UIComponent, Text, FieldBaseDelegate, FieldMultiInput, Token, ExpandableText, DynamicDateRange, OperatorDynamicDateOption, DynamicDateRangeConditionsType, FilterOperatorUtil) {

	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.Authors", {

		onInit: function () {
			var oFilterField = this.byId("ff1");

			oFilterField.removeOperator("LT");
			oFilterField.removeOperator("GT");
			oFilterField.removeOperator("NE");
			oFilterField.removeOperator("NOTBT");
			oFilterField.removeOperator("NOTLT");
			oFilterField.removeOperator("NOTLE");
			oFilterField.removeOperator("NOTGT");
			oFilterField.removeOperator("NOTGE");

			oFilterField.addOperator("CustomDateEmpty");

			// var aDateOperators = FilterOperatorUtil.getOperatorsForType("Date");
			// var aNewDateOperators = aDateOperators.filter(function(val) {
			// 	return ["LT", "GT", "NE", "NOTBT", "NOTLT", "NOTLE", "NOTGT", "NOTGE"].indexOf(val) === -1;
			//   });
			// aNewDateOperators.push("CustomDateEmpty");
			// oFilterField.setOperators(aNewDateOperators);
		},

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
