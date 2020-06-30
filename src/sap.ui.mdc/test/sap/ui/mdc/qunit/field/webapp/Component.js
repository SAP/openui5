sap.ui.define([
	"sap/ui/core/UIComponent"
 ], function(UIComponent) {
	"use strict";

	return UIComponent.extend("test.sap.ui.mdc.field.Field.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {

			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
 });
