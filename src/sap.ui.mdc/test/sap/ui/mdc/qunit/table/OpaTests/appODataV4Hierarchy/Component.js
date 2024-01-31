// define a root UIComponent which exposes the main view

sap.ui.define([
	"sap/ui/core/UIComponent"
], function(
	/** @type sap.ui.core.UIComponent */ UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.table.OpaTests.appODataV4Hierarchy.Component", {
		metadata: {
			id: "appODataV4Hierarchy",
			manifest: "json"
		}
	});
});