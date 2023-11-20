// define a root UIComponent which exposes the main view

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/odata/v4/ODataModel"
], function(UIComponent, ODataModel) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.sample.FieldDisplay.Component", {
		metadata: {
			manifest: "json"
		},

		init: function(){
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
		}
	});

});
