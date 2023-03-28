// define a root UIComponent which exposes the main view

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FakeLrepConnectorLocalStorage"
], function(
	/** @type sap.ui.core.UIComponent */ UIComponent,
	/** @type sap.ui.fl.FakeLrepConnectorLocalStorage */ FakeLrepConnectorLocalStorage) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.table.OpaTests.appMDCTreeTableV4.Component", {
		metadata: {
			id: "appMDCTreeTableV4",
			manifest: "json"
		},

		init: function() {
			FakeLrepConnectorLocalStorage.enableFakeConnector();

			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
});