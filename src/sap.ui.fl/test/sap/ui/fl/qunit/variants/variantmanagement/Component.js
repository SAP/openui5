/*
 * @${copyright}
 */

sap.ui.define([
	'sap/ui/core/UIComponent', 'sap/ui/fl/FakeLrepConnectorLocalStorage'
], function(UIComponent, FakeLrepConnectorLocalStorage) {
	"use strict";
	return UIComponent.extend("sap.ui.fl.sample.variantmanagement.Component", {
		metadata: {
			rootView: "sap.ui.fl.sample.variantmanagement.VariantManagement",
			dependencies: {
				libs: [
					"sap.m", "sap.ui.fl"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"VariantManagement.view.xml", "VariantManagement.controller.js"
					]
				}
			}
		},
		init: function() {
			FakeLrepConnectorLocalStorage.enableFakeConnector();

			UIComponent.prototype.init.apply(this, arguments);
		},
		destroy: function() {
			FakeLrepConnectorLocalStorage.disableFakeConnector();
			UIComponent.prototype.destroy.apply(this, arguments);
		}
	});
});
