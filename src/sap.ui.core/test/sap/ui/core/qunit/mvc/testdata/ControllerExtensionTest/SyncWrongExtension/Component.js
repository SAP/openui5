sap.ui.define([
	"sap/ui/core/UIComponent"
], function ( UIComponent) {
	"use strict";

	var Component = UIComponent.extend("mvc.testdata.ControllerExtensionTest.SyncWrongExtension.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
	return Component;
}, true);
