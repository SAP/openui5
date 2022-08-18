sap.ui.define([
	'sap/ui/Device',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (Device, Controller, JSONModel) {
	"use strict";

	var ImageController = Controller.extend("sap.m.sample.ImageErrorWithIllustration.controller.ImageController", {

		onInit: function () {
			var bIsPhone = Device.system.phone,
				oImgModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/img.json"));

			this.getView().setModel(new JSONModel({
				imageHeight: bIsPhone ? "5em" : "10em",
				imageWidth: bIsPhone ? "5em" : "10em",
				hasError: false
			}));
			this.getView().setModel(oImgModel, "img");
		},

		onLoad: function () {
			this.getView().getModel().setProperty("/hasError", false);
		},

		onError: function () {
			this.getView().getModel().setProperty('/hasError', true);
		},

		onPressSetSrc: function () {
			this.getView().getModel("img").setProperty('/products/pic1', "/some/random/url");
		}
	});


	return ImageController;

});