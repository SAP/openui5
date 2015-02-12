jQuery.sap.declare("sap.m.sample.MessageBoxInfo.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MessageBoxInfo.Component", {

	metadata : {
		rootView : "sap.m.sample.MessageBoxInfo.V",
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
