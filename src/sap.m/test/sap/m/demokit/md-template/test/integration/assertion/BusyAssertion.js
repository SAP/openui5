sap.ui.define(['sap/ui/test/Opa5'],
	function(Opa5) {
	"use strict";

	return Opa5.extend("sap.ui.demo.mdtemplate.test.integration.assertion.BusyAssertion", {
		iShouldSeeTheAppBusyIndicator: function () {
			return this.waitFor({
				id : "idAppControl",
				viewName : "App",
				success : function (oRootView) {
					// we set the view busy, so we need to query the parent of the app
					ok(oRootView.getParent().getBusy(), "The app is busy");
				},
				errorMessage : "The app is not busy."
			});
		},

		iShouldSeeTheMasterBusyIndicator: function () {
			return this.waitFor({
				id : "page",
				viewName : "Master",
				success : function (oPage) {
					// we set the view busy, so we need to query the parent of the app
					ok(oPage.getParent().getBusy(), "The master view is busy");
				},
				errorMessage : "The master view is not busy."
			});
		},

		iShouldSeeTheDetailBusyIndicator: function () {
			return this.waitFor({
				id : "detailPage",
				viewName : "Detail",
				success : function (oPage) {
					// we set the view busy, so we need to query the parent of the app
					ok(oPage.getParent().getBusy(), "The master view is busy");
				},
				errorMessage : "The master view is not busy."
			});
		}

	});
}, /* bExport= */ true);
