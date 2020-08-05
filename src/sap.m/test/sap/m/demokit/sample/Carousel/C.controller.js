sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.Carousel.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);

			var oImgModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/img.json"));
			this.getView().setModel(oImgModel, "img");
		}

	});
});