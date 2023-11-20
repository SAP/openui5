sap.ui.define([
	'sap/m/MessageToast',
	'sap/ui/Device',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(MessageToast, Device, Controller, JSONModel) {
"use strict";

var ImageGroupController = Controller.extend("sap.m.sample.image.Controller", {

	onInit: function() {
		var bIsPhone = Device.system.phone,
		oImgModel;

		this.getView().setModel(new JSONModel({
			imageWidth: bIsPhone ? "5em" : "10em"
		}));

		// set explored app's demo model on this sample
		oImgModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/image/img.json"));
		this.getView().setModel(oImgModel, "img");

	},

	handleImagePress: function() {
		MessageToast.show("The image has been pressed");
	}
});


return ImageGroupController;

});