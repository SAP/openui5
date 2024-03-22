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

			/**
			 * @deprecated As of version 1.120.0
			 */
			(function () {
				var MyHost = Host.extend("MyHost", { });

				MyHost.prototype.getCsrfToken = function (mCSRFTokenConfig) {
					if (mCSRFTokenConfig.data.request.url === "invalid") {
						return Promise.reject("CSRF token could not be resolved by the host");
					}

					return Promise.resolve("HostTokenValue");
				};

				var oHostResolveToken = new MyHost();

				this.getView().byId("deprecatedHostFeat1").setHost(oHostResolveToken);
				this.getView().byId("deprecatedHostFeat2").setHost(oHostResolveToken);
				this.getView().byId("deprecatedCsrfCard1").setHost(oHost);
				this.getView().byId("deprecatedCsrfCard2").setHost(oHost);
				this.getView().byId("deprecatedCsrfCard3").setHost(oHost);
				this.getView().byId("deprecatedCsrfCard4").setHost(oHostResolveToken);
				this.getView().byId("deprecatedCsrfCard5").setHost(oHostResolveToken);
				this.getView().byId("deprecatedCsrfCard6").setHost(oHost);
				this.getView().byId("deprecatedCsrfCard7").setHost(oHost);
				this.getView().byId("deprecatedCsrfCard8").setHost(oHost);
			}.bind(this))();
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