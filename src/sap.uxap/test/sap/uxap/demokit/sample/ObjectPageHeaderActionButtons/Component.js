sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageHeaderActionButtons.Component", {

		metadata: {
			rootView: "sap.uxap.sample.ObjectPageHeaderActionButtons.ObjectPageHeaderActionButtons",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ObjectPageHeaderActionButtons.view.xml",
						"../AnchorBar/mySimpleBlock.js",
						"../AnchorBar/mySimpleBlock.view.xml"
					]
				}
			}
		}
	});
	return Component;
});
