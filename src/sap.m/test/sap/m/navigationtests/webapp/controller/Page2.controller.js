sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.demo.navigationTests.controller.Page2", {

		bntPress: function () {
			this.getOwnerComponent().getRouter().navTo("home");
		}
	});
});