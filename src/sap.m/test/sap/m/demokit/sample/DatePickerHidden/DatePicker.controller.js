sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast'
	], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.DatePickerHidden.DatePicker", {

		openDatePicker: function(oEvent) {
			this.getView().byId("HiddenDP").openBy(oEvent.getSource().getDomRef());
		},

		changeDateHandler: function(oEvent) {
			MessageToast.show("Date selected: " + oEvent.getParameter("value"));
		}

	});

});
