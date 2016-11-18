sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("flexiblecolumnlayout.DetailDetail", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
		},
		handleDetailDetailPress: function () {
			this.oRouter.navTo("page2");
		},
		handleFullScreen: function () {
			var sFullScreen = this.getOwnerComponent().isFullScreen() ? "" : "fs";
			this.oRouter.navTo("detailDetail", {fs: sFullScreen});
		},
		handleClose: function () {
			this.oRouter.navTo("detail");
		}
	});
}, true);
