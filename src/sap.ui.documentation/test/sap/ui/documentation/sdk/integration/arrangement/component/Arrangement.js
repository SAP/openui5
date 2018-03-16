sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
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

	return Opa5.extend("sap.ui.documentation.sdk.test.arrangement.WelcomeJourneyArrangement", {
		iStartMyApp : function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui.documentation.sdk"
				},
				hash: ""
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