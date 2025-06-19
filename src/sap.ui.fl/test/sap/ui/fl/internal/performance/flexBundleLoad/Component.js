sap.ui.define([
	"sap/ui/core/UIComponent"
], function(
	UIComponent
) {
	"use strict";

	return UIComponent.extend("fl.performance.flexBundleLoad.Component", {
		metadata: {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},

		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			UIComponent.prototype.constructor.apply(this, aArgs);
		}
	});
});