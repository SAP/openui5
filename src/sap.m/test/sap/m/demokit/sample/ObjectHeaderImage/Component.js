jQuery.sap.declare("sap.m.sample.ObjectHeaderImage.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectHeaderImage.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectHeaderImage.V",
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