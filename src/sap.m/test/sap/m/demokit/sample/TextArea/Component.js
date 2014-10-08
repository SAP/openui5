jQuery.sap.declare("sap.m.sample.TextArea.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TextArea.Component", {

	metadata : {
		rootView : "sap.m.sample.TextArea.V",
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