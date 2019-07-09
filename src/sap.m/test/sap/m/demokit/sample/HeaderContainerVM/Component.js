sap.ui.define([ 'sap/ui/core/UIComponent' ],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.HeaderContainerVM.Component", {
		metadata : {
		    includes : "HeaderContainerVM/style.css",
			manifest: "json"
		}
	});

	return Component;
});