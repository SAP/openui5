sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.m.TableScrollToIndex.controller.Detail", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
		},
		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, product: this._product});
		},
		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, product: this._product});
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {layout: sNextLayout});
		},
		_onProductMatched: function (oEvent) {
			this._product = oEvent.getParameter("arguments").product || this._product || "0";
			this.getView().bindElement({
				path: "/ProductCollection/" + this._product,
				model: "products"
			});
		}
	});
}, true);
