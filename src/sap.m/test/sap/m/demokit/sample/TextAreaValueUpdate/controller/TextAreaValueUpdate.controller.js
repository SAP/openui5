sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.TextAreaValueUpdate.controller.TextAreaValueUpdate", {

		onInit: function () {
			var oModel = new JSONModel({ data: {} });
			this.getView().setModel(oModel);
		},

		handleLiveChange: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			this.byId("getValue").setText(sValue);
		}
	});
});
