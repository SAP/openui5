sap.ui.define([
		'jquery.sap.global',
		'sap/ui/Device',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Device, Controller, JSONModel) {
	"use strict";

	var ScrollContainerController = Controller.extend("sap.m.sample.ScrollContainer.ScrollContainer", {

		onInit: function() {
			this.getView().setModel(new JSONModel({
				width: (Device.system.phone) ? "50em" : "100em"
			}));

			// set explored app's demo model on this sample
			var oImgModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/img.json");
			this.getView().setModel(oImgModel, "img");
		}
	});


	return ScrollContainerController;

});