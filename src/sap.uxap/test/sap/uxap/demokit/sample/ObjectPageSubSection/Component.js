sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageSubSection.Component", {

		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.ObjectPageSubSection.ObjectPageSubSection",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ObjectPageSubSection.view.xml",
						"MultiViewBlock.js",
						"MultiViewBlockCollapsed.view.xml",
						"MultiViewBlockCommon.controller.js",
						"MultiViewBlockExpanded.view.xml"
					]
				}
			}
		}
	});

	return Component;
}, true);
