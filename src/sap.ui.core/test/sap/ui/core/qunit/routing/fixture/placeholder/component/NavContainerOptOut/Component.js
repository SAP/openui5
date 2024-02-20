sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";
	var Component = UIComponent.extend("qunit.placeholder.component.NavContainerOptOut.Component", {
		metadata : {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		}
	});
	return Component;
});
