sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.DynamicPageFreeStyle.Component", {

			metadata: {
				rootView: "sap.f.sample.DynamicPageFreeStyle.DynamicPageFreeStyle",
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
