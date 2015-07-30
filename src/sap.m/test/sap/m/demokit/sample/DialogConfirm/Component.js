sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.DialogConfirm.Component", {

		metadata: {
			rootView: "sap.m.sample.DialogConfirm.V",
			dependencies: {
				libs: [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config: {
				sample: {
					files: [
						"V.view.xml",
						"C.controller.js",
						"ApproveDialog.fragment.xml",
						"RejectDialog.fragment.xml",
						"SubmitDialog.fragment.xml",
						"ConfirmDialog.fragment.xml"
					]
				}
			}
		}
	});


	return Component;

});
