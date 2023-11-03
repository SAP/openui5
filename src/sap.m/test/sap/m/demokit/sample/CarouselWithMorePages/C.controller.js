sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/m/library"
], function (Controller, Device, JSONModel, library) {
	"use strict";

	return Controller.extend("sap.m.sample.CarouselWithMorePages.C", {

		onInit: function () {
			var oProductsModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json")),
				iPagesCount = 1;

			if (Device.system.desktop) {
				iPagesCount = 4;
			} else if (Device.system.tablet) {
				iPagesCount = 2;
			}

			var oSettingsModel = new JSONModel({ pagesCount: iPagesCount });
			oProductsModel.setSizeLimit(10);

			this.getView().setModel(oSettingsModel, "settings");
			this.getView().setModel(oProductsModel, "products");
		},

		onNumberOfPages: function (oEvent) {
			const oCarouselCustomLayout = this.byId("carouselSample").getCustomLayout(),
				sVisiblePageCount = oEvent.getParameter("value");

				oCarouselCustomLayout.setVisiblePagesCount(Number(sVisiblePageCount));
		},

		OnScrollModeChange: function(oEvent) {
				const CarouselScrollMode = library.CarouselScrollMode,
					bViewMode = oEvent.getParameter("state"),
					sScrollMode = bViewMode ?  CarouselScrollMode.VisiblePages : CarouselScrollMode.SinglePage;

					this.byId("carouselSample").getCustomLayout()?.setScrollMode(sScrollMode);
		}
	});
});