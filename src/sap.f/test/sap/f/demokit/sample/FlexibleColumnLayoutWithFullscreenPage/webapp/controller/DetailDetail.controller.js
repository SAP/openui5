sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.f.FlexibleColumnLayoutWithFullscreenPage.controller.DetailDetail", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detailDetailDetail").attachPatternMatched(this._onProductMatched, this);
		},
		handleItemPress: function (oEvent) {
			var supplierPath = oEvent.getSource().getBindingContext("products").getPath(),
				supplier = supplierPath.split("/").slice(-1).pop();

			this.oRouter.navTo("detailDetailDetail", {layout: sap.f.LayoutType.ThreeColumnsMidExpanded, category: this._category, product: this._product, supplier: supplier});
		},
		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.navigateToView(sNextLayout, "detailDetail");
		},
		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.navigateToView(sNextLayout, "detailDetail");
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.navigateToView(sNextLayout, "detail");
		},
		navigateToView: function (sNextLayout, sNextView) {
			this.oRouter.navTo(sNextView, {layout: sNextLayout, category: this._category, product: this._product});
		},
		_onProductMatched: function (oEvent) {
			this._product = oEvent.getParameter("arguments").product || this._product || "0";
			this._category = oEvent.getParameter("arguments").category || this._category;

			this.getView().bindElement({
				path: "/ProductCollection/" + this._product,
				model: "products"
			});
		}
	});
}, true);
