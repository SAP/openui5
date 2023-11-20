sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/library",
	"sap/ui/integration/Host",
	"sap/m/MessageToast"
], function (Controller, library, Host, MessageToast) {
	"use strict";

	var CardBlockingMessageType = library.CardBlockingMessageType;

	return Controller.extend("sap.ui.integration.sample.BlockingMessage.Main", {
		onInit: function () {
			var oHost = new Host({
				cardStateChanged: this.onCardStateChanged.bind(this)
			});

			this.getView().byId("card1").setHost(oHost);
			this.getView().byId("card2").setHost(oHost);
		},
		onCardStateChanged: function (oEvent) {
			var oCard = oEvent.getParameter("card");

			if (oCard.getBlockingMessage() && oCard.getBlockingMessage().type === CardBlockingMessageType.NoData) {
				MessageToast.show(oCard.getId() + " is empty", {
					at: "center center"
				});
			}
		}
	});
});