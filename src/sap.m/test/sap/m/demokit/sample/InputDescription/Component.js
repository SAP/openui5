jQuery.sap.declare("sap.m.sample.InputDescription.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.InputDescription.Component", {

	metadata : {
		rootView : "sap.m.sample.InputDescription.V",
		dependencies : {
			libs : [
				"sap.m"
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