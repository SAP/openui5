sap.ui.define(["sap/ui/core/UIComponent"], function(Component) {
	"use strict";

	return Component.extend("sap.ui.fl.qunit.extensionPoint.testApp.Component", {

		metadata: {
			version: "1.0",
			rootView: {
				viewName: "sap.ui.fl.qunit.extensionPoint.testApp.view.Main",
				type: "XML",
				id: "mainView"
			},
			customizing: {},
			manifest: "json"
		}
	});
});