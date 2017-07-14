sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.m.sample.TreeJSONLazyLoading.Component", {
		metadata: {
			rootView: "sap.m.sample.TreeJSONLazyLoading.Page",
			dependencies: {
				libs: [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config: {
				sample: {
					files: [
						"Page.view.xml",
						"Page.controller.js"
					]
				}
			}
		}
	});
});
