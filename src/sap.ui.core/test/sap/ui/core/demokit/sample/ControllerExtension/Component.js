sap.ui.define([
	"sap/ui/core/UIComponent",
	//Only needed to simulate changes
	"sap/ui/fl/FakeLrepConnectorLocalStorage"
], function(
	UIComponent,
	FakeLrepConnectorLocalStorage
) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.ControllerExtension.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.ui.core.sample.ControllerExtension.Main",
				"type": "XML",
				"async": true,
				"id" : "main"
			},
			dependencies: {
				libs: [
					"sap.m", "sap.ui.fl"
				]
			},
			config: {
				sample: {
					files: [
						"Main.view.xml",
						"Main.controller.js",
						"ReuseExtension.js",
						"CustomerExtension.js",
						"CustomerExtension.fragment.xml",
						"OtherCustomerExtension.js",
						"OtherCustomerExtension.fragment.xml",
						"Component.js"
					]
				}
			}
		},
		constructor: function () {
			//Only needed to simulate changes
			FakeLrepConnectorLocalStorage.enableFakeConnector(null, sap.ui.core.sample.ControllerExtension.Component, "1.56.0");
			UIComponent.prototype.constructor.apply(this, arguments);
		}
	});
});
