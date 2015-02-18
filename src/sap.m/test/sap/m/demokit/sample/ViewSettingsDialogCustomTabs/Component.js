jQuery.sap.declare("sap.m.sample.ViewSettingsDialogCustomTabs.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ViewSettingsDialogCustomTabs.Component", {

	metadata : {
		rootView : "sap.m.sample.ViewSettingsDialogCustomTabs.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		includes : [ "style.css" ],
		config : {
			sample : {
				files : [
					"style.css",
					"V.view.xml",
					"C.controller.js",
					"Dialog.fragment.xml",
					"DialogSingleCustomTab.fragment.xml"
				]
			}
		}
	}
});
