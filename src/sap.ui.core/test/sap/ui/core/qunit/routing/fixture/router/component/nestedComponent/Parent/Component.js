sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("qunit.router.component.nestedComponent.Parent.Component", {
		metadata : {
			manifest: "json"
		}
	});

	return Component;

});
