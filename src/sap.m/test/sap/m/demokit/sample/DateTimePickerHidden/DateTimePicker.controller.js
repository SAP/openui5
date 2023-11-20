sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast'
	], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.DateTimePickerHidden.DateTimePicker", {

		openDateTimePicker: function(oEvent) {
			this.getView().byId("HiddenDTP").openBy(oEvent.getSource().getDomRef());
		},

		changeDateTimeHandler: function(oEvent) {
			MessageToast.show("Date and Time selected: " + oEvent.getParameter("value"));
		}

	});

});
