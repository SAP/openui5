sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.AnchorBarNoPopover.Component", {
		metadata: {
			rootView: "sap.uxap.sample.AnchorBarNoPopover.AnchorBarNoPopover",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"AnchorBarNoPopover.view.xml"
					]
				}
			}
		}
	});

	return Component;
}, true);
