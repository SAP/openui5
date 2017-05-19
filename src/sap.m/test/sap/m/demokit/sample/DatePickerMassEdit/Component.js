sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.sample.DatePickerMassEdit.Component", {

			metadata: {
				rootView: "sap.m.sample.DatePickerMassEdit.Page",
				dependencies: {
					libs: [
						"sap.m",
						"sap.ui.unified"
					]
				},
				config: {
					sample: {
						files: [
							"Page.view.xml",
							"Page.controller.js"
						]
					}
				}
			}
		});

		return Component;

	});