jQuery.sap.declare("sap.m.sample.Tokenizer.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Tokenizer.Component", {

	metadata : {
		rootView : "sap.m.sample.Tokenizer.Page",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"Page.view.xml",
					"Page.controller.js"
				]
			}
		}
	}
});