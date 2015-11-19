sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageHeaderContentPriorities.Component", {

		metadata: {
			rootView: "sap.uxap.sample.ObjectPageHeaderContentPriorities.ObjectPageHeaderContentPriorities",
			dependencies: {
				libs: ["sap.m"]
			},
			config: {
				sample: {
					stretch: true,
					files: ["ObjectPageHeaderContentPriorities.view.xml"]
				}
			}
		}
	});

	return Component;
});
