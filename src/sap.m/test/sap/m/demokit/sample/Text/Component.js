jQuery.sap.declare("sap.m.sample.Text.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Text.Component", {

	metadata : {
		rootView : "sap.m.sample.Text.V",
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