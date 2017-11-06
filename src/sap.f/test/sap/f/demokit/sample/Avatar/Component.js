sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.Avatar.Component", {
			metadata: {
				rootView: {
					"viewName": "sap.f.sample.Avatar.Avatar",
					"type": "XML",
					"async": true
				},
				dependencies: {
					libs: [
						"sap.f"
					]
				},
				config: {
					sample : {
						stretch : true,
						files : [
							"Avatar.view.xml",
							"Avatar.controller.js"
						]
					}
				}
			}
		});
	});
