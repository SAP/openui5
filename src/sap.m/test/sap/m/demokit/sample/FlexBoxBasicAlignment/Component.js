jQuery.sap.declare("sap.m.sample.FlexBoxBasicAlignment.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.FlexBoxBasicAlignment.Component", {

	metadata : {
		rootView : "sap.m.sample.FlexBoxBasicAlignment.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"V.view.xml"
				]
			}
		}
	}
});