sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	return Controller.extend("sap.ui.integration.localServices.oath3lo.consentApp.Controller", {
		onInit: function () {
			// this happens in the 3th party app where the login and giving a consent happens.
			const oUrlParams = new URLSearchParams(window.location.search);
			this._sRedirect = oUrlParams.get('redirect');

			this.byId("redirectText").setText("After consent you will be redirected to " + this._sRedirect);
		},

		giveConsent: function () {
			window.location.href = this._sRedirect;
		}
	});
});