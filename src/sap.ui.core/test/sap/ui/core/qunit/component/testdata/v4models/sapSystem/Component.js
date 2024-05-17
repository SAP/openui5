/*
 * ${copyright}
 */

// Provides class sap.ui.test.v4models.sapSystem.Component
sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.test.v4models.sapSystem.Component", {
		interfaces: ["sap.ui.core.IAsyncContentCreation"],
		metadata: {
			manifest: "json"
		}
	});

});
