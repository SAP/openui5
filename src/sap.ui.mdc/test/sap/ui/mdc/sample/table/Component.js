// define a root UIComponent which exposes the main view

sap.ui.define([
	"sap/ui/core/UIComponent", "sap/ui/fl/FakeLrepConnectorLocalStorage"
], function(UIComponent, FakeLrepConnectorLocalStorage) {
	"use strict";

	return UIComponent.extend("MDCTable.Component", {
		metadata: {
			manifest: "json"
		},
		/**
		 * Initialize the application
		 *
		 * @returns {sap.ui.core.Control} the content
		 */
		createContent: function() {
			this._bCalled = true;
			FakeLrepConnectorLocalStorage.enableFakeConnector();
			return this.oView;
		},
		_addContent: function(oView) {
			this.oView = oView;
			if (this._bCalled) {
				this.setAggregation("rootControl", oView);
			}
		}
	});

});
