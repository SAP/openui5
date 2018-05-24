sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/Device',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, Device, Controller, JSONModel) {
	"use strict";

	var ImageGroupController = Controller.extend("sap.m.sample.Image.ImageGroup", {

		onInit: function() {
			var bIsPhone = Device.system.phone;
			this.getView().setModel(new JSONModel({
				imageWidth: bIsPhone ? "5em" : "10em"
			}));

			// set explored app's demo model on this sample
			var oImgModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/img.json");
			this.getView().setModel(oImgModel, "img");
		},

		handleImage3Press: function(evt) {
			MessageToast.show("The image has been pressed");
		}
	});


	return ImageGroupController;

});