sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/Device',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessageToast, Device, Controller, JSONModel) {
	"use strict";

	var ImageGroupController = Controller.extend("sap.m.sample.Image.controller.ImageGroup", {

		onInit: function() {
			var bIsPhone = Device.system.phone,
			svgLogo = sap.ui.require.toUrl("sap/m/sample/Image/images/sap-logo.svg"),
			oImgModel;

			this.getView().setModel(new JSONModel({
				imageWidth: bIsPhone ? "5em" : "10em",
				svgLogo: svgLogo
			}));

			// set explored app's demo model on this sample
			oImgModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/img.json");
			this.getView().setModel(oImgModel, "img");

		},

		handleImage3Press: function(evt) {
			MessageToast.show("The image has been pressed");
		}
	});


	return ImageGroupController;

});