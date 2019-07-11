sap.ui.define([
		'sap/ui/Device',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Device, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ScrollContainer.controller.ScrollContainer", {

		onInit: function() {
			this.getView().setModel(new JSONModel({
				width: (Device.system.phone) ? "50em" : "100em"
			}));

			// set explored app's demo model on this sample
			var oImgModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/img.json");
			this.getView().setModel(oImgModel, "img");
		}
	});
});