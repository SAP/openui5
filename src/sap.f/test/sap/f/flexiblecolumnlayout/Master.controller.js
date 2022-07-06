sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("flexiblecolumnlayout.Master", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
		},
		handleMasterPress: function () {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
			this.oRouter.navTo("detail", {layout: oNextUIState.layout});
		}
	});
});
