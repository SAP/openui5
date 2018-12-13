sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageHeaderBackgroundDesign.Component", {

		metadata: {
			rootView: "sap.uxap.sample.ObjectPageHeaderBackgroundDesign.ObjectPageHeaderBackgroundDesign",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ObjectPageHeaderBackgroundDesign.view.xml",
						"../AnchorBar/mySimpleBlock.js",
						"../AnchorBar/mySimpleBlock.view.xml"
					]
				}
			}
		}
	});
	return Component;
});
