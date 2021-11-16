sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.DateRangeSelectionHidden.DateRangeSelection", {

		openDateRangeSelection: function(oEvent) {
			this.getView().byId("HiddenDRS").openBy(oEvent.getSource().getDomRef());
		},

		changeDateHandler: function(oEvent) {
			sap.m.MessageToast.show("Date range selected: " + oEvent.getParameter("value"));
		}

	});

});
