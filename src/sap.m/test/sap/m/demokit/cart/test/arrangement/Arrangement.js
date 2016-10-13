sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
	return Opa5.extend("sap.ui.demo.cart.test.arrangement.DeleteProductJourneyArrangement", {
		iStartMyApp : function (sAdditionalUrlParameters) {
			sAdditionalUrlParameters = sAdditionalUrlParameters || "";
			return this.iStartMyAppInAFrame('../index.html?sap-ui-language=en' + sAdditionalUrlParameters);
		},

		iStartMyAppSaveForLaterActivated: function () {
			return this.iStartMyApp("&saveForLater=true")
		},

		iStartMyComponent : function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui.demo.cart"
				},
				hash: ""
			});
		}
	});
});

