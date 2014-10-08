jQuery.sap.declare("sap.m.sample.MessageBoxCustom.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MessageBoxCustom.Component", {

	metadata : {
		rootView : "sap.m.sample.MessageBoxCustom.V",
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
					"Layout.fragment.xml"
				]
			}
		}
	}
});