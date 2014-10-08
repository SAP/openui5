jQuery.sap.declare("sap.m.sample.RadioButton.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.RadioButton.Component", {

	metadata : {
		rootView : "sap.m.sample.RadioButton.V",
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