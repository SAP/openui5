sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.DynamicPageFreeStyle.Component", {

			metadata: {
				rootView: {
					"viewName": "sap.f.sample.DynamicPageFreeStyle.DynamicPageFreeStyle",
					"type": "XML",
					"async": true
				},
				dependencies: {
					libs: [
						"sap.f",
						"sap.m",
						"sap.ui.layout",
						"sap.ui.table",
						"sap.ui.unified"
					]
				},
				config: {
					sample : {
						stretch : true,
						files : [
						    "DynamicPageFreeStyle.controller.js",
							"DynamicPageFreeStyle.view.xml"
						]
					}
				}
			}
		});
	});
