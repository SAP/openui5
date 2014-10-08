jQuery.sap.declare("sap.m.sample.RadioButtonGroup.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.RadioButtonGroup.Component", {

	metadata : {
		rootView : "sap.m.sample.RadioButtonGroup.V",
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