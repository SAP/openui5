jQuery.sap.declare("sap.m.sample.NavContainer.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.NavContainer.Component", {

	metadata : {
		rootView : "sap.m.sample.NavContainer.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		includes : [ "NavContainer/style.css" ],
		config : {
			sample : {
				files : [
					"V.view.xml",
					"C.controller.js",
					"style.css"
				]
			}
		}
	}
});