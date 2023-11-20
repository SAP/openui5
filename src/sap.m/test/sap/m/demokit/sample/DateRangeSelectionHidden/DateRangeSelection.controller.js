sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast'
	], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.DateRangeSelectionHidden.DateRangeSelection", {

		openDateRangeSelection: function(oEvent) {
			this.getView().byId("HiddenDRS").openBy(oEvent.getSource().getDomRef());
		},

		changeDateHandler: function(oEvent) {
			MessageToast.show("Date range selected: " + oEvent.getParameter("value"));
		}

	});

});
