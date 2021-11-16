sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.DatePickerHidden.DatePicker", {

		openDatePicker: function(oEvent) {
			this.getView().byId("HiddenDP").openBy(oEvent.getSource().getDomRef());
		},

		changeDateHandler: function(oEvent) {
			sap.m.MessageToast.show("Date selected: " + oEvent.getParameter("value"));
		}

	});

});
