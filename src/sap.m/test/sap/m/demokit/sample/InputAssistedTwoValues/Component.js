sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.InputAssistedTwoValues.Component", {

		metadata : {
			rootView : "sap.m.sample.InputAssistedTwoValues.V",
			config : {
				sample : {
					files : [
						"V.view.xml",
						"C.controller.js",
						"Dialog.fragment.xml"
					],
					description : "This example shows how to easily implement an assisted input with two-value suggestions"
				}
			}
		}
	});

	return Component;

});
