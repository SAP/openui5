sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/webc/main/Toast"
], function(Controller, JSONModel, Toast) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.Toast.C", {

		clickHandler: function() {
			var demoToast = this.getView().byId("demoToast");
			demoToast.show();
		}

	});
});