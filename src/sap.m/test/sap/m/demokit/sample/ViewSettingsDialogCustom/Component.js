jQuery.sap.declare("sap.m.sample.ViewSettingsDialogCustom.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ViewSettingsDialogCustom.Component", {

	metadata : {
		rootView : "sap.m.sample.ViewSettingsDialogCustom.V",
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