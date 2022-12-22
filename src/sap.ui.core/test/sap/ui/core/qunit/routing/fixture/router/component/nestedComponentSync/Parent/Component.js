sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("qunit.router.component.nestedComponentSync.Parent.Component", {
		metadata : {
			manifest: "json"
		}
	});

	return Component;

});
