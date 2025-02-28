sap.ui.define(['sap/ui/test/Opa5', './BaseArrangement'], function (Opa5, BaseArrangement) {
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

	return BaseArrangement.extend("sap.ui.documentation.sdk.test.arrangement.WelcomeJourneyArrangement", {
		iStartMyApp : function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui.documentation.sdk",
					manifest: true
				},
				hash: ""
			});
		},

		// feature toggle tests
		iStartMyAppSafeForLaterActivated: function () {
			if (!new URLSearchParams(window.location.search).has("safeForLater")) {
				addSaveForLater();
			}
			return this.iStartMyApp();
		}
	});
});