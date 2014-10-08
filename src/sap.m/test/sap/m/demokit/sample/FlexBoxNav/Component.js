jQuery.sap.declare("sap.m.sample.FlexBoxNav.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.FlexBoxNav.Component", {

	metadata : {
		rootView : "sap.m.sample.FlexBoxNav.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		includes : [ "FlexBoxNav/style.css" ],
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