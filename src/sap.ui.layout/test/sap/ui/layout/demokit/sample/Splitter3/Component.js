sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.Splitter3.Component", {

		metadata : {
			manifest: "json"
		},

		onAfterRendering : function() {
			this.oContainer.setHeight("100%");
		}
	});

	return Component;

});
