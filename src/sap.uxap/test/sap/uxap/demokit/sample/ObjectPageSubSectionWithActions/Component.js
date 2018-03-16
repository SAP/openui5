sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageSubSectionWithActions.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.ObjectPageSubSectionWithActions.ObjectPageSubSectionWithActions",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: ["sap.m"]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ObjectPageSubSectionWithActions.view.xml"
					]
				}
			}
		}
	});
	return Component;
}, true);
