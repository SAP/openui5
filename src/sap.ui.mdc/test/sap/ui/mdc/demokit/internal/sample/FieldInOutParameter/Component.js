// define a root UIComponent which exposes the main view

sap.ui.define([
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.sample.FieldInOutParameter.Component", {
		metadata: {
			manifest: "json"
		},

		init: function(){
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
		}
	});

});
