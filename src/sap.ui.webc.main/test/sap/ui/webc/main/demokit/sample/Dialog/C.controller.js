sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.Dialog.C", {

		handleOpen: function () {
			var oDialog = this.getView().byId("helloDialog");
			oDialog.show();
		},

		handleClose: function () {
			var oDialog = this.getView().byId("helloDialog");
			oDialog.close();
		}

	});
});