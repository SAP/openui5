jQuery.sap.declare("sap.m.sample.InputSuggestionsDynamic.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.InputSuggestionsDynamic.Component", {

	metadata : {
		rootView : "sap.m.sample.InputSuggestionsDynamic.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"V.view.xml",
					"C.controller.js"
				]
			}
		}
	}
});