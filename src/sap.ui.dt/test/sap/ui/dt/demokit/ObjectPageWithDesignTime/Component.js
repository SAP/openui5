sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.dt.demo.Component", {

		metadata: {
			rootView: "sap.ui.dt.demo.ObjectPageWithDesignTime",
			dependencies: {
				libs: ["sap.m"]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ObjectPageWithDesignTime.view.xml",
						"ObjectPageWithDesignTime.controller.js"
					]
				}
			}
		}
	});

	return Component;
}, true);
