sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.AvatarWithAffordance.controller.AvatarWithAffordance", {
		onInit: function () {
			var oJsonModel = new JSONModel({
				GettyImages: sap.ui.require.toUrl("sap/m/images/284133_GettyImages-145058106_2600.jpg"),
				Shutterstock: sap.ui.require.toUrl("sap/m/images/283930_shutterstock_56287057.jpg"),
				LowShutterstock: sap.ui.require.toUrl("sap/m/images/282627_low_shutterstock_402830878.jpg"),
				LightBox: sap.ui.require.toUrl("sap/m/images/274827_274827_l_srgb_s_gl.jpg")
			});
			this.getView().setModel(oJsonModel);
		},
		onPress: function(oEvent) {
			MessageToast.show(oEvent.getSource().getId() + " Pressed");
		}
	});
});