sap.ui.define(["sap/ui/core/UIComponent"],
	function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.FieldGroup.Component", {

		metadata: {
			rootView: "sap.ui.core.sample.FieldGroup.Page",
			dependencies: {
				libs: [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config: {
				sample: {
					stretch : true,
					files: [
						"Page.view.xml",
						"Page.controller.js"
					]
				}
			}
		}
	});
});