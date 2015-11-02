sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.SingleView.Component", {

		metadata: {
			rootView: "sap.uxap.sample.SingleView.SingleView",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"SingleView.view.xml",
						"blocks/SimpleForm.js",
						"blocks/SimpleForm.view.xml"
					]
				}
			}
		}
	});
	return Component;
});
