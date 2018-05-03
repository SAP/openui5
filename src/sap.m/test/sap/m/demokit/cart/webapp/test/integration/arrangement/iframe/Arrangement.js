sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	return Opa5.extend("sap.ui.demo.cart.test.integration.arrangement.iframe.Arrangement", {
		iStartMyApp : function (bKeepStorage, oAdditionalUrlParameters) {
			// The cart local storage should be deleted when the app starts except when testing it.
			if (!bKeepStorage) {
				jQuery.sap.require("jquery.sap.storage");
				var oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
				oLocalStorage.remove("SHOPPING_CART");
			}
			oAdditionalUrlParameters = oAdditionalUrlParameters || {};
			return this.iStartMyAppInAFrame('../../index.html?sap-ui-language=en&sap-ui-animation=false&serverDelay=0' +
				oAdditionalUrlParameters.hash);
		}
	});
});
