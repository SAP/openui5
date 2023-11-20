sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageStrip",
	"sap/ui/core/InvisibleMessage",
	"sap/ui/core/library"
], function(Controller, MessageStrip, InvisibleMessage, library) {
	"use strict";

	var InvisibleMessageMode = library.InvisibleMessageMode;

	return Controller.extend("sap.m.sample.invisibleMessaging.Controller", {
		onInit: function () {
			this.oInvisibleMessage = InvisibleMessage.getInstance();
		},

		fnHandler: function (oEvent) {
			var sMessage;
			var oInput = this.getView().byId("input");
			var oMessageStrip = new MessageStrip({
				showCloseButton: true,
				showIcon: true
			}).addStyleClass("sapUiSmallMarginBeginEnd");

			if (oInput.getValue() === "") {
				sMessage = "Assertive type of InivisibleMessage was created and added to the static area.";
				oMessageStrip
					.setType("Error")
					.setText(sMessage);
				this.getView().byId("page").addContent(oMessageStrip);
				this.oInvisibleMessage.announce(sMessage, InvisibleMessageMode.Assertive);
			} else {
				sMessage = "Polite type of InivisibleMessage was created created and added to the static area.";
				oMessageStrip
					.setType("Success")
					.setText(sMessage);
				this.getView().byId("page").addContent(oMessageStrip);
				this.oInvisibleMessage.announce(sMessage, InvisibleMessageMode.Polite);
			}

			setTimeout(function () {
				oMessageStrip.close();
				oMessageStrip.destroy();
			}, 3000);
		}
	});
});
