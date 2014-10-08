jQuery.sap.declare("sap.m.sample.FlexBoxNested.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.FlexBoxNested.Component", {

	metadata : {
		rootView : "sap.m.sample.FlexBoxNested.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		includes : [ "FlexBoxNested/style.css" ],
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