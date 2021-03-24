sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.Avatar.controller.Avatar", {
		onInit: function () {
			var oJsonModel = new JSONModel({
				Speakers: sap.ui.require.toUrl("sap/m/images/Speakers_avatar_01.jpg"),
				Woman01: sap.ui.require.toUrl("sap/m/images/Woman_avatar_01.png"),
				Woman02: sap.ui.require.toUrl("sap/m/images/Woman_avatar_02.png"),
				Screw: sap.ui.require.toUrl("sap/m/images/Screw_avatar_01.jpg"),
				Lamp: sap.ui.require.toUrl("sap/m/images/Lamp_avatar_01.jpg")
			});
			this.getView().setModel(oJsonModel);
		},
		onPress: function(oEvent) {
			MessageToast.show(oEvent.getSource().getId() + " Pressed");
		}
	});
});