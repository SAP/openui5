sap.ui.define(["sap/ui/core/UIComponent"], function(Component) {
	"use strict";

	// ui5lint-disable-next-line async-component-flags
	return Component.extend("sap.ui.fl.qunit.extensionPoint.testAppLegacy.Component", {
		metadata: {
			version: "1.0",
			rootView: {
				viewName: "sap.ui.fl.qunit.extensionPoint.testAppLegacy.view.Main",
				type: "XML",
				id: "mainView"
			},
			customizing: {},
			manifest: "json"
		}
	});
});