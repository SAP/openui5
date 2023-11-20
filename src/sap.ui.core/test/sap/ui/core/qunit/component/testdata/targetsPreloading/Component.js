/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/Controller"
], function(UIComponent) {
	"use strict";

	// new Component
	const Component = UIComponent.extend("sap.ui.test.targetsPreloading.Component", {
		metadata : {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);
		}
	});

	return Component;
});
