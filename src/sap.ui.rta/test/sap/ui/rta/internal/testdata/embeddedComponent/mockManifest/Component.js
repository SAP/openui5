sap.ui.define([
	"sap/ui/core/UIComponent"
], function(
	UIComponent
) {
	"use strict";

	return UIComponent.extend("sap.ui.rta.test.embeddedComponent.mockManifest.Component", {
		metadata: {
			manifest: "json"
		},

		constructor: function () {
			UIComponent.prototype.constructor.apply(this, arguments);
		},

		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
		},

		destroy: function() {
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		}
	});
});
