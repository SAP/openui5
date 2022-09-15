/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FakeLrepConnectorLocalStorage"
], function (UIComponent, FakeLrepConnectorLocalStorage) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.LinkIntegrationTesting.appUnderTestPageObject.Component", {
		metadata : {
			manifest: "json"
		},
		init: function() {
			FakeLrepConnectorLocalStorage.enableFakeConnector();

			UIComponent.prototype.init.apply(this, arguments);
		},
		destroy: function() {
			FakeLrepConnectorLocalStorage.disableFakeConnector();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},
		exit: function() {
			FakeLrepConnectorLocalStorage.disableFakeConnector();
		}
	});
});
