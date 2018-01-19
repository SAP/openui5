sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.DynamicPageAnalyticalTable.Component", {

			metadata: {
				rootView: {
					"viewName": "sap.f.sample.DynamicPageAnalyticalTable.DynamicPageAnalyticalTable",
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
							"DynamicPageAnalyticalTable.view.xml",
							"DynamicPageAnalyticalTable.controller.js"
						]
					}
				}
			}
		});
	});
