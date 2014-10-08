jQuery.sap.declare("sap.ui.layout.sample.VerticalLayout.Component");

sap.ui.core.UIComponent.extend("sap.ui.layout.sample.VerticalLayout.Component", {

	metadata : {
		rootView : "sap.ui.layout.sample.VerticalLayout.V",
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