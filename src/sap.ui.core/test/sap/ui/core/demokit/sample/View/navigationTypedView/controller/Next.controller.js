sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], (Controller, History) => {
	"use strict";

	return Controller.extend("sap.ui.core.sample.View.navigationTypedView.controller.Next", {
		onNavButtonPress(oController, sHomeRouteName) {
			if (History.getInstance().getPreviousHash() !== undefined) {
				window.history.go(-1);
			} else {
				// User visited this Next view directly via a deep link.
				sap.ui.require(["sap/ui/core/UIComponent"], (UIComponent) => {
					const oRouter = UIComponent.getRouterFor(oController);
					oRouter.navTo(sHomeRouteName); // Allow the user to navigate up to home.
				});
			}
		}

	});
});