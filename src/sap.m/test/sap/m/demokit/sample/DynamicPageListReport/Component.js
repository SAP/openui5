sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.m.sample.DynamicPageListReport.Component", {

			metadata: {
				rootView: "sap.m.sample.DynamicPageListReport.DynamicPageListReport",
				dependencies: {
					libs: [
						"sap.m",
						"sap.ui.layout"
					]
				},
				config: {
					sample: {
						files: [
							"DynamicPageListReport.view.xml",
							"DynamicPageListReport.controller.js"
						]
					}
				}
			}
		});
	});
