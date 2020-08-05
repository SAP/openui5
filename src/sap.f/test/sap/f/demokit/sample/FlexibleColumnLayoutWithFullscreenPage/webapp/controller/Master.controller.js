sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.f.FlexibleColumnLayoutWithFullscreenPage.controller.Master", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this._bDescendingSort = false;
		},
		onListItemPress: function (oEvent) {
			var sCategory = oEvent.getSource().getCells()[0].getTitle(),
				bPhone = this.getOwnerComponent().getModel().getProperty("/isPhone"),
				aProducts = this.getView().getModel("products").getData().ProductCollection,
				iProduct = 0;

			for (var i = 0; i < aProducts.length; i++) {
				var oProduct = aProducts[i];

				if (oProduct.Category === sCategory) {
					iProduct = i;
					break;
				}
			}

			if (bPhone) {
				this.oRouter.navTo("detail", {layout: sap.f.LayoutType.OneColumn, category: sCategory});
			} else {
				this.oRouter.navTo("detailDetail", {layout: sap.f.LayoutType.TwoColumnsMidExpanded, category: sCategory, product: iProduct});
			}
		}
	});
});
