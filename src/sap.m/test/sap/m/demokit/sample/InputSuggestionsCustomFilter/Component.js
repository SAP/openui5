jQuery.sap.declare("sap.m.sample.InputSuggestionsCustomFilter.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.InputSuggestionsCustomFilter.Component", {

	metadata : {
		rootView : "sap.m.sample.InputSuggestionsCustomFilter.V",
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