jQuery.sap.declare("sap.m.sample.ObjectIdentifier.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectIdentifier.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectIdentifier.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"V.view.xml",
					"C.controller.js"
				]
			}
		}
	}
});