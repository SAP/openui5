sap.ui.define(['sap/ui/core/UIComponent', 'sap/m/IllustrationPool'],
function (UIComponent, IllustrationPool) {
	"use strict";

	return UIComponent.extend("sap.m.sample.IllustratedMessageInPage.Component", {

		metadata: {
			manifest: "json"
		},

		init : function () {

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
});
