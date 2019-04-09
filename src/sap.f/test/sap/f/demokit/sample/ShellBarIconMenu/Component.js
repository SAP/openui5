sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.ShellBarIconMenu.Component", {
			metadata: {
				rootView: {
					"viewName": "sap.f.sample.ShellBarIconMenu.ShellBarIconMenu",
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
							"ShellBarIconMenu.view.xml",
							"ShellBarIconMenu.controller.js"
						]
					}
				}
			}
		});
	});
