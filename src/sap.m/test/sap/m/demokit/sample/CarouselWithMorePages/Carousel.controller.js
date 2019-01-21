sap.ui.define(['jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/Device',
	'sap/ui/model/json/JSONModel'],
	function(jQuery, Controller, Device, JSONModel) {
	"use strict";

	var CarouselController = Controller.extend("sap.m.sample.CarouselWithMorePages.Carousel", {

		onInit : function (evt) {
			var oProductsModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json"),
				oSettingsModel,
				iPagesCount;

			if (Device.system.desktop) {
				iPagesCount = 4;
			} else if (Device.system.tablet) {
				iPagesCount = 2;
			} else {
				iPagesCount = 1;
			}

			oSettingsModel = new JSONModel({ pagesCount: iPagesCount});
			oProductsModel.setSizeLimit(6);

			this.getView().setModel(oSettingsModel, "settings");
			this.getView().setModel(oProductsModel, "products");
		}
	});

	return CarouselController;
});