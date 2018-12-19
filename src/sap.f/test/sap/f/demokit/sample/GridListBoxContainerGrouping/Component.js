sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.GridListBoxContainerGrouping.Component", {

			metadata: {
				rootView: {
					"viewName": "sap.f.sample.GridListBoxContainerGrouping.GridListBoxContainerGroupingHeadersGrowing",
					"type": "XML",
					"async": true
				},
				dependencies: {
					libs: [
						"sap.f",
						"sap.m"
					]
				},
				config: {
					sample: {
						files: [
							"GridListBoxContainerGroupingHeadersGrowing.view.xml",
							"GridListBoxContainerGroupingHeadersGrowing.controller.js"
						]
					}
				}
			}
		});
	});
