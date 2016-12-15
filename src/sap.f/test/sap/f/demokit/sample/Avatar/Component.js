sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.Avatar.Component", {
			metadata: {
				rootView: "sap.f.sample.Avatar.Avatar",
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
