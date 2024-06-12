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
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/enums/OperatorName"
], function (Controller, UIComponent, Text, FieldBaseDelegate, FieldMultiInput, Token, ExpandableText, DynamicDateRange, OperatorDynamicDateOption, DynamicDateRangeConditionsType, FilterOperatorUtil, OperatorName) {

	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.Authors", {

		onInit: function () {
			var oFilterField = this.byId("ff1");

			oFilterField.removeOperator(OperatorName.LT);
			oFilterField.removeOperator(OperatorName.GT);
			oFilterField.removeOperator(OperatorName.NE);
			oFilterField.removeOperator(OperatorName.NOTBT);
			oFilterField.removeOperator(OperatorName.NOTLT);
			oFilterField.removeOperator(OperatorName.NOTLE);
			oFilterField.removeOperator(OperatorName.NOTGT);
			oFilterField.removeOperator(OperatorName.NOTGE);
			oFilterField.removeOperator(OperatorName.Empty);

			oFilterField.addOperator("CustomDateEmpty");
			oFilterField.addOperator("TOTODAY");

			// var aDateOperators = FilterOperatorUtil.getOperatorsForType("Date");
			// var aNewDateOperators = aDateOperators.filter(function(val) {
			// 	return ["Empty", "LT", "GT", "NE", "NOTBT", "NOTLT", "NOTLE", "NOTGT", "NOTGE"].indexOf(val) === -1;
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
