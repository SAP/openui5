// define a root UIComponent which exposes the main view

sap.ui.define([
	"sap/ui/core/UIComponent"
], function(
	/** @type sap.ui.core.UIComponent */ UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.table.OpaTests.appMDCTreeTableV4.Component", {
		metadata: {
			id: "appMDCTreeTableV4",
			manifest: "json"
		},

		init: function() {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
});