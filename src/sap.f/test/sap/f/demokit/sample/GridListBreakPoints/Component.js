sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.GridListBreakPoints.Component", {

			metadata: {
				rootView: {
					"viewName": "sap.f.sample.GridListBreakPoints.V",
					"type": "XML",
					"async": true
				},
				dependencies: {
					libs: [
						"sap.f",
						"sap.m"
					]
				},
				includes : [ "main.css" ],
				config: {
					sample: {
						files: [
							"V.view.xml",
							"C.controller.js",
							"main.css"
						]
					}
				}
			}
		});
	});
