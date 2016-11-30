sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("flexiblecolumnlayout.Master", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
		},
		handleMasterPress: function () {
			var oNextUIState = this.getOwnerComponent().getFlexibleColumnLayout().getNextUIState();
			this.oRouter.navTo("detail", {layout: oNextUIState.layout});
		}
	});
}, true);
