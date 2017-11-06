sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageWithDynamicHeader.Component", {

		metadata: {
			rootView: "sap.uxap.sample.ObjectPageWithDynamicHeader.ObjectPageWithDynamicHeader",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ObjectPageWithDynamicHeader.view.xml"
					]
				}
			}
		}
	});
	return Component;
});
