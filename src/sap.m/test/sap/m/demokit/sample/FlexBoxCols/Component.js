jQuery.sap.declare("sap.m.sample.FlexBoxCols.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.FlexBoxCols.Component", {

	metadata : {
		rootView : "sap.m.sample.FlexBoxCols.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		includes : [ "FlexBoxCols/style.css" ],
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