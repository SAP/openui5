sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";

	return Controller.extend("sap.ui.demo.navigationTests.controller.Home", {

		bntInfoMsgPress: function () {
			MessageBox.show("Some Info");

			setTimeout(function () {
				this.getOwnerComponent().getRouter().navTo("page2");
			}.bind(this), 2000);
		},
		bntErrorMsgPress :function () {
			MessageBox.error("Operation was not successful", {
				closeOnNavigation: false
			});

			setTimeout(function () {
				this.getOwnerComponent().getRouter().navTo("page2");
			}.bind(this), 2000);
		}
	});
});