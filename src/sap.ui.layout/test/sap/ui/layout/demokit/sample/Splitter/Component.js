jQuery.sap.declare("sap.ui.layout.sample.Splitter.Component");

sap.ui.core.UIComponent.extend("sap.ui.layout.sample.Splitter.Component", {

	metadata : {
		rootView : "sap.ui.layout.sample.Splitter.Splitter",
		includes : [
			"css/splitter.css", // This is how it should be...
			"Splitter/css/splitter.css"  // This is what works right now
		],
		dependencies : {
			libs : [
				"sap.ui.commons",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"Splitter.view.xml",
					"Splitter.controller.js"
				]
			}
		}
	}
});