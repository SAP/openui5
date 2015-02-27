sap.ui.define(['sap/ui/test/Opa5'],
	function(Opa5) {
	"use strict";

	return Opa5.extend("sap.ui.demo.mdtemplate.test.integration.action.BusyAction", {
		iWaitUntilTheAppBusyIndicatorIsGone: function () {
			return this.waitFor({
				id : "idAppControl",
				viewName : "App",
				// inline-matcher directly as function
				matchers : function(oRootView) {
					// we set the view busy, so we need to query the parent of the app
					return oRootView.getParent().getBusy() === false;
				},
				success : function (oRootView) {
					ok(true, "The app is not busy busy anymore");
				},
				errorMessage : "The app is still busy."
			});
		},

		iLookAtTheScreen : function () {
			return this;
		}

	});
});
