sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.InputKeyValueTabularSuggestions.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.InputKeyValueTabularSuggestions.V",
				"type": "XML",
				"async": true
			},
			config : {
				sample : {
					files : [
						"V.view.xml",
						"C.controller.js",
						"Dialog.fragment.xml"
					],
					description : "In this example assisted input is provided with table-like suggestions where several columns can display more details."
				}
			}
		}
	});

	return Component;

});
