jQuery.sap.declare("sap.m.sample.MessageBoxTypes.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MessageBoxTypes.Component", {

	metadata : {
		rootView : "sap.m.sample.MessageBoxTypes.V",
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
