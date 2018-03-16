sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	function addSaveForLater() {
		var sStateToAdd;
		if (window.location.search) {
			sStateToAdd = "&";
		} else {
			sStateToAdd = "?";
		}

		sStateToAdd += "safeForLater=true";

		window.history.replaceState("dummy", {}, window.location.pathname + window.location.search + sStateToAdd + window.location.hash);
	}

	return Opa5.extend("sap.ui.demo.cart.test.arrangement.DeleteProductJourneyArrangement", {
		iStartMyApp : function (bKeepStorage, oAdditionalUrlParameters) {
			// The cart local storage should be deleted when the app starts except when testing it.
			if (!bKeepStorage) {
				jQuery.sap.require("jquery.sap.storage");
				var oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
				oLocalStorage.remove("SHOPPING_CART");
			}
			oAdditionalUrlParameters = oAdditionalUrlParameters || {};
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui.demo.cart"
				},
				hash: oAdditionalUrlParameters.hash
			});
		},

		// feature toggle tests
		iStartMyAppSafeForLaterActivated: function () {
			if (!jQuery.sap.getUriParameters().get("safeForLater")) {
				addSaveForLater();
			}
			return this.iStartMyApp();
		}
	});
});

