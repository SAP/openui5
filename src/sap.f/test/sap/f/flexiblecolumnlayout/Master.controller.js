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
			this.oRouter.navTo("detail");
		}
	});
}, true);
