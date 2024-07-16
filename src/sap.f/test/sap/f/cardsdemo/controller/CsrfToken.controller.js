sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/integration/Host",
		"../localService/csrfTokens/Storage"
	], function(Controller, Host, CSRFTokensStorage) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.CsrfToken", {
		onInit: function () {
			var oHost = new Host({
				actions: [
					{
						type: "Custom",
						text: "Refresh",
						action: function (oCard, oButton) {
							oCard.refresh();
						}
					}
				]
			});

			this.getView().byId("card1").setHost(oHost);
			this.getView().byId("card2").setHost(oHost);
			this.getView().byId("card3").setHost(oHost);
			this.getView().byId("card4").setHost(oHost);
			this.getView().byId("card5").setHost(oHost);
			this.getView().byId("card6").setHost(oHost);
		},
		markSharedTokenAsExpired: function () {
			CSRFTokensStorage.markExpired(CSRFTokensStorage.getCurrentTokenKey());
		},
		refreshAllCards: function () {
			["reusedTokenCard1", "reusedTokenCard2", "reusedTokenCard3", "reusedTokenCard4" ].forEach((sId) => {
				this.getView().byId(sId).refreshData();
			});
		}
	});
});