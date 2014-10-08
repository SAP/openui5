jQuery.sap.declare("sap.m.sample.DialogSearch.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.DialogSearch.Component", {

	metadata : {
		rootView : "sap.m.sample.DialogSearch.V",
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