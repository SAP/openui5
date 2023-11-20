sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast'
	], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.DynamicDateRangeHidden.DynamicDateRange", {

		openDynamicDateRange: function(oEvent) {
			this.getView().byId("HiddenDDR").openBy(oEvent.getSource().getDomRef());
		},

		changeDateHandler: function(oEvent) {
			var sOutput = "",
				oValue = oEvent.getParameter("value");

			sOutput += "\nOperator: " + oValue.operator;
			oValue.values.length && oValue.values.forEach(function(item, index) {
				sOutput += "\nValue " + (index + 1) + ": " + item;
			});
			MessageToast.show("Selected: \n" + sOutput);
		}

	});

});
