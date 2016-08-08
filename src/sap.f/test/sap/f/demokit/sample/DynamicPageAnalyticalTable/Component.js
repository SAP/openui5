sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.DynamicPageAnalyticalTable.Component", {

			metadata: {
				rootView: "sap.f.sample.DynamicPageAnalyticalTable.DynamicPageAnalyticalTable",
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
							"DynamicPageAnalyticalTable.view.xml"
						]
					}
				}
			}
		});
	});
