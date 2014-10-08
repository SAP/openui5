jQuery.sap.declare("sap.m.sample.InputAssisted.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.InputAssisted.Component", {

	metadata : {
		rootView : "sap.m.sample.InputAssisted.V",
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
					"C.controller.js",
					"Dialog.fragment.xml"
				]
			}
		}
	}
});