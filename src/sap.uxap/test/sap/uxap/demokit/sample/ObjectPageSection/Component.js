sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageSection.Component", {

		metadata: {
			rootView: "sap.uxap.sample.ObjectPageSection.ObjectPageSection",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ObjectPageSection.view.xml"
					]
				}
			}
		}
	});
	return Component;
}, true);
