jQuery.sap.declare("sap.m.sample.ViewSettingsDialog.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ViewSettingsDialog.Component", {

	metadata : {
		rootView : "sap.m.sample.ViewSettingsDialog.V",
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