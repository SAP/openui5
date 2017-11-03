sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.sample.WizardCurrentStep.Component", {

			metadata: {
				rootView: {
					"viewName": "sap.m.sample.WizardCurrentStep.V",
					"type": "XML",
					"async": true
				},
				dependencies: {
					libs: [
						"sap.m",
						"sap.ui.layout"
					]
				},
				config: {
					sample: {
						stretch : true,
						files: [
							"V.view.xml",
							"Linear.view.xml",
							"Branching.view.xml",
							"Branching.controller.js",
							"C.controller.js"
						]
					}
				}
			}
		});

		return Component;

	});
