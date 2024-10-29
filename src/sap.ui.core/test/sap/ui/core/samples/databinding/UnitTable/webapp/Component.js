sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent, UnitType) {
	"use strict";

	return UIComponent.extend("sap.ui.core.samples.unittable.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.call(this); // create the views based on the url/hash
		}
	});
});
