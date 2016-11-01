sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("flexiblecolumnlayout.Detail", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
		},
		handleDetailPress: function () {
			var sFullScreen = this.getOwnerComponent().isFullScreen() ? "fs" : "";
			this.oRouter.navTo("detailDetail", {fs: sFullScreen});
		},
		handleFullScreen: function () {
			var sFullScreen = this.getOwnerComponent().isFullScreen() ? "" : "fs";
			this.oRouter.navTo("detail", {fs: sFullScreen});
		},
		handleClose: function () {
			this.oRouter.navTo("master");
		}
	});
}, true);
