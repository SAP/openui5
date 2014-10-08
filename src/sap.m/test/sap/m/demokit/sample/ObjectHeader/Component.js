jQuery.sap.declare("sap.m.sample.ObjectHeader.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectHeader.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectHeader.V",
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