jQuery.sap.declare("sap.m.sample.ProgressIndicator.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ProgressIndicator.Component", {

	metadata : {
		rootView : "sap.m.sample.ProgressIndicator.V",
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