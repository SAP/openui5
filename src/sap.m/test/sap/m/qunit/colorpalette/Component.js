sap.ui.define([
	'sap/ui/core/UIComponent'
	],
	function (UIComponent) {
	"use strict";

	return UIComponent.extend("cp.opa.test.app.Component", {
		metadata: {
			manifest: "json",
			version: "0.1"
		},
		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
		}
	});
});
