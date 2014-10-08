jQuery.sap.declare("sap.m.sample.SelectDialog.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.SelectDialog.Component", {

	metadata : {
		rootView : "sap.m.sample.SelectDialog.V",
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