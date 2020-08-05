sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast'
	], function(Controller,JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectMarker.Table", {

		onInit: function () {
			var aData = [
				{ product: "Power Projector 4713", type: "Locked" },
				{ product: "Power Projector 4713", type: "LockedBy", additionalInfo: "John Doe" },
				{ product: "Power Projector 4713", type: "LockedBy" },
				{ product: "Gladiator MX", type: "Draft" },
				{ product: "Hurricane GX", type: "Unsaved" },
				{ product: "Hurricane GX", type: "UnsavedBy", additionalInfo: "John Doe" },
				{ product: "Hurricane GX", type: "UnsavedBy"},
				{ product: "Hurricane GX", type: "Unsaved" },
				{ product: "Webcam", type: "Favorite" },
				{ product: "Deskjet Super Highspeed", type: "Flagged" }
			];

			var oModel = new JSONModel({
				modelData: aData
			});
			this.getView().setModel(oModel);
		},
		onPress: function(oEvent) {
			MessageToast.show(oEvent.getParameter("type") + " marker pressed!");
		}
	});

});
