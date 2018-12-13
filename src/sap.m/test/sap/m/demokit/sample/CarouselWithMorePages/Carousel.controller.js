sap.ui.define(['jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'],
	function(jQuery, Controller, JSONModel) {
	"use strict";

	var CarouselController = Controller.extend("sap.m.sample.CarouselWithMorePages.Carousel", {

		onInit : function (evt) {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");

			this.getView().setModel(oModel);
		}
	});

	return CarouselController;
});