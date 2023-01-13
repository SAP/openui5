sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";
	var Component = UIComponent.extend("qunit.target.component.componentContainer.Parent.Component", {
		metadata : {
			manifest: "json"
		}
	});
	return Component;
});
