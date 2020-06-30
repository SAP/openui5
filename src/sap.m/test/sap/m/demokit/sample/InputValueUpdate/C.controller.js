sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.InputValueUpdate.C", {

		onInit: function () {
			var oModel = new JSONModel({ data: {} });
			this.getView().setModel(oModel);
		},

		onLiveChange: function (oEvent) {
			var sNewValue = oEvent.getParameter("value");
			this.byId("getValue").setText(sNewValue);
		}

	});
});