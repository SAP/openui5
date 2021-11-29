sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/m/MessageToast',
		'sap/ui/integration/Host'
	], function(Controller, MessageToast, Host) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.CsrfToken", {

		onInit: function () {
			var oHost = new Host({
				actions: [
					{
						type: 'Custom',
						text: 'Refresh',
						action: function (oCard, oButton) {
							oCard.refresh();
						}
					}
				]
			});

			var MyHost = Host.extend("MyHost", { });

			MyHost.prototype.getCsrfToken = function (mCSRFTokenConfig) {
				if (mCSRFTokenConfig.data.request.url === "invalid") {
					return Promise.reject("CSRF token could not be resolved by the host");
				}

				return Promise.resolve("HostTokenValue");
			};

			var oHostResolveToken = new MyHost();

			this.getView().byId('card1').setHost(oHost);
			this.getView().byId('card2').setHost(oHost);
			this.getView().byId('card3').setHost(oHost);
			this.getView().byId('card4').setHost(oHostResolveToken);
			this.getView().byId('card5').setHost(oHostResolveToken);
			this.getView().byId('card6').setHost(oHost);
		}
	});
});