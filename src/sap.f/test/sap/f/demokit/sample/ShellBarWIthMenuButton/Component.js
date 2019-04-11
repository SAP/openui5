sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.ShellBarWIthMenuButton.Component", {
			metadata: {
				rootView: {
					"viewName": "sap.f.sample.ShellBarWIthMenuButton.ShellBarWIthMenuButton",
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
							"ShellBarWIthMenuButton.view.xml",
							"ShellBarWIthMenuButton.controller.js"
						]
					}
				}
			}
		});
	});
