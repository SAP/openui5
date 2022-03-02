sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.Avatar.C", {

		onInit: function () {
			var oJsonModel = new JSONModel({
				Speakers: sap.ui.require.toUrl("sap/ui/webc/main/images/Speakers_avatar_01.jpg"),
				Woman01: sap.ui.require.toUrl("sap/ui/webc/main/images/Woman_avatar_01.png"),
				Woman02: sap.ui.require.toUrl("sap/ui/webc/main/images/Woman_avatar_02.png"),
				Screw: sap.ui.require.toUrl("sap/ui/webc/main/images/Screw_avatar_01.jpg"),
				Lamp: sap.ui.require.toUrl("sap/ui/webc/main/images/Lamp_avatar_01.jpg")
			});
			this.getView().setModel(oJsonModel);
		},
		handleClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText(oEvent.getSource().getId() + " Pressed");
			demoToast.show();
		}

	});
});