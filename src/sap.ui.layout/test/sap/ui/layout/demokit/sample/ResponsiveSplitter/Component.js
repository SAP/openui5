sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.layout.sample.ResponsiveSplitter.Component", {

			metadata: {
				rootView: {
					"viewName": "sap.ui.layout.sample.ResponsiveSplitter.V",
					"type": "XML",
					"async": true
				},
				dependencies: {
					libs: [
						"sap.ui.layout"
					]
				},
				config: {
					sample: {
						stretch : true,
						files: [
							"V.view.xml",
							"C.controller.js"
						]
					}
				}
			}
		});

		return Component;

	});
