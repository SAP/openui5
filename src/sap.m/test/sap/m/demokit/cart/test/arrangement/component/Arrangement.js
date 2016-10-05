sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
	function addSafeForLater() {
		var sStateToAdd;
		if (window.location.search) {
			sStateToAdd = "&";
		} else {
			sStateToAdd = "?"
		}

		sStateToAdd += "safeForLater=true";

		window.history.replaceState("dummy", {}, window.location.pathname + window.location.search + sStateToAdd + window.location.hash);
	}

	return Opa5.extend("sap.ui.demo.cart.test.arrangement.DeleteProductJourneyArrangement", {
		iStartMyApp : function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui.demo.cart"
				},
				hash: ""
			});
		},

		// feature toggle tests
		iStartMyAppSafeForLaterActivated: function () {
			if (!jQuery.sap.getUriParameters().get("safeForLater")) {
				addSafeForLater();
			}
			return this.iStartMyApp();
		}
	});
});

