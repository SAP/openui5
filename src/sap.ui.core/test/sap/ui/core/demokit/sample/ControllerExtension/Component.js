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
			manifest: "json"
		},
		constructor: function () {
			//Only needed to simulate changes
			FakeLrepConnectorLocalStorage.enableFakeConnector(null, this.getMetadata().getClass(), "1.56.0");
			UIComponent.prototype.constructor.apply(this, arguments);
		}
	});
});
