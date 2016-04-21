sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.ObjectMarker.Table", {

		onInit: function () {
			var aData = [
				{ product: "Power Projector 4713", type: "Locked" },
				{ product: "Gladiator MX", type: "Draft" },
				{ product: "Hurricane GX", type: "Unsaved" },
				{ product: "Webcam", type: "Favorite" },
				{ product: "Deskjet Super Highspeed", type: "Flagged" }
			];

			var oModel = new sap.ui.model.json.JSONModel({
				modelData: aData
			});
			this.getView().setModel(oModel);
		},
		onPress: function(oEvent) {
			sap.m.MessageToast.show(oEvent.getParameter("type") + " marker pressed!");
		}
	});

	return TableController;

});
