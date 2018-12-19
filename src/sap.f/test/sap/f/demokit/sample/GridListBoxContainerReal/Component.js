sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.GridListBoxContainerReal.Component", {

			metadata: {
				rootView: {
					"viewName": "sap.f.sample.GridListBoxContainerReal.GridListBoxContainerReal",
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
							"GridListBoxContainerReal.view.xml",
							"GridListBoxContainerReal.controller.js"
						]
					}
				}
			}
		});
	});
