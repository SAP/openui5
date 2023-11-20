sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/util/Storage"
], function (Opa5, Storage) {
	"use strict";

	return Opa5.extend("sap.ui.demo.cart.test.integration.arrangements.iframe.Startup", {

		/**
		 * Starts the mocked app in an iframe
		 * @param {object} oOptionsParameter An object that contains the configuration for starting up the app.
		 * @param {int} oOptionsParameter.delay A custom delay to start the app with
		 * @param {int} oOptionsParameter.keepStorage Does not clear the local storage when set to true
		 * @param {string} [oOptionsParameter.hash] The in app hash can also be passed separately for better readability in tests
		 * @param {boolean} [oOptionsParameter.autoWait=true] Automatically wait for pending requests while the application is starting up.
		 */
		iStartMyApp : function (oOptionsParameter) {
			var oOptions = oOptionsParameter || {};

			// The cart local storage should be deleted when the app starts except when testing it.
			if (!oOptions.keepStorage) {
				var oLocalStorage = new Storage(Storage.Type.local);
				oLocalStorage.remove("SHOPPING_CART");
			}

			// start the app with a minimal delay to make tests fast but still async to discover basic timing issues
			oOptions.delay = oOptions.delay || 1;

			return this.iStartMyAppInAFrame('../../index.html?sap-ui-language=en-US'
				+ '&sap-ui-animation=false&serverDelay=' + oOptions.delay
				+ (oOptions.hash ? "#/" + oOptions.hash : ""));
		}
	});
});
