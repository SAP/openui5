sap.ui.define([
	'sap/ui/test/Opa5',
	"sap/ui/util/Storage"
], function (Opa5, Storage) {
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

	return Opa5.extend("sap.ui.demo.cart.test.integration.arrangement.component.Arrangement", {
		iStartMyApp : function (bKeepStorage, oAdditionalUrlParameters) {
			// The cart local storage should be deleted when the app starts except when testing it.
			if (!bKeepStorage) {
				var oLocalStorage = Storage.getInstance(Storage.Type.local);
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

