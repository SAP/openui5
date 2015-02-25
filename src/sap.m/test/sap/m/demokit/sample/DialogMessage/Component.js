jQuery.sap.declare("sap.m.sample.DialogMessage.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.DialogMessage.Component", {

	metadata: {
		rootView: "sap.m.sample.DialogMessage.V",
		dependencies: {
			libs: [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config: {
			sample: {
				files: [
					"V.view.xml",
					"C.controller.js"
				]
			}
		}
	}
});