jQuery.sap.declare("sap.m.sample.TextMaxLines.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TextMaxLines.Component", {

	metadata : {
		rootView : "sap.m.sample.TextMaxLines.V",
		includes : [ "TextMaxLines/style.css" ],
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				files : [
					"V.view.xml",
					"style.css"
				]
			}
		}
	}
});