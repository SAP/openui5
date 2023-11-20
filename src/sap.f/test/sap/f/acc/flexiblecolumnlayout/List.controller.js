sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("flexiblecolumnlayout.List", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
		},
		handleListPress: function () {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
			this.oRouter.navTo("detail", {layout: oNextUIState.layout});
		}
	});
});
