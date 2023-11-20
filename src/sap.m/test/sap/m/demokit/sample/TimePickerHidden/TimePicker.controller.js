sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast'
	], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.TimePickerHidden.TimePicker", {

		openTimePicker: function(oEvent) {
			this.getView().byId("HiddenTP").openBy(oEvent.getSource().getDomRef());
		},

		changeTimeHandler: function(oEvent) {
			MessageToast.show("Time selected: " + oEvent.getParameter("value"));
		}

	});

});
