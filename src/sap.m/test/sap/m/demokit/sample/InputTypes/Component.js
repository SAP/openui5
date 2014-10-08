jQuery.sap.declare("sap.m.sample.InputTypes.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.InputTypes.Component", {

	metadata : {
		rootView : "sap.m.sample.InputTypes.V",
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