sap.ui.define([
		'sap/ui/Device',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/library'
	], function(Device, Controller, JSONModel, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.ImageMode
	var ImageMode = mobileLibrary.ImageMode;

	var ImageController = Controller.extend("sap.m.sample.ImageModeBackground.controller.ImageController", {

		onInit: function() {
			var bIsPhone = Device.system.phone,
				oImgModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/img.json");

			this.getView().setModel(new JSONModel({
				imageHeight: bIsPhone ? "5em" : "10em",
				imageWidth: bIsPhone ? "5em" : "10em",
				imageMode: ImageMode.Background,
				imageBackgroundSize: "2em"
			}));

			this.getView().setModel(oImgModel, "img");
		}
	});


	return ImageController;

});