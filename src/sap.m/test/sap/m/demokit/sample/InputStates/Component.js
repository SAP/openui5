jQuery.sap.declare("sap.m.sample.InputStates.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.InputStates.Component", {

	metadata : {
		rootView : "sap.m.sample.InputStates.V",
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