jQuery.sap.declare("sap.m.sample.ObjectHeaderActiveAttributes.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectHeaderActiveAttributes.Component", {

	metadata: {
		rootView: "sap.m.sample.ObjectHeaderActiveAttributes.V",
		dependencies: {
			libs: [
				"sap.m", "sap.ui.layout"
			]
		},
		config: {
			sample: {
				files: [
					"V.view.xml", "C.controller.js"
				]
			}
		}
	}
});