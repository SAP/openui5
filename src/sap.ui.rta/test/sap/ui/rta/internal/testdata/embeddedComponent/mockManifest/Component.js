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

		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			UIComponent.prototype.constructor.apply(this, aArgs);
		},

		init(...aArgs) {
			UIComponent.prototype.init.apply(this, aArgs);
			this.getRouter().initialize();
		},

		destroy(...aArgs) {
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, aArgs);
		}
	});
});
