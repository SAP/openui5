jQuery.sap.declare("sap.m.sample.InputSuggestionsOpenSearch.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.InputSuggestionsOpenSearch.Component", {

	metadata : {
		rootView : "sap.m.sample.InputSuggestionsOpenSearch.V",
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
					"C.controller.js",
					"MockServer.js"
				]
			}
		}
	}
});