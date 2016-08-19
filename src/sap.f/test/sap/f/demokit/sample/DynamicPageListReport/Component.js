sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.DynamicPageListReport.Component", {

			metadata: {
				rootView: "sap.f.sample.DynamicPageListReport.DynamicPageListReport",
				dependencies: {
					libs: [
						"sap.f",
						"sap.m",
						"sap.ui.layout"
					]
				},
				config: {
					sample: {
						stretch : true,
						files: [
							"DynamicPageListReport.view.xml",
							"DynamicPageListReport.controller.js"
						]
					}
				}
			}
		});
	});
