jQuery.sap.declare("sap.m.sample.BusyDialogLight.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.BusyDialogLight.Component", {

	metadata : {
		rootView : "sap.m.sample.BusyDialogLight.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"V.view.xml",
					"C.controller.js",
					"BusyDialog.fragment.xml"
				]
			}
		}
	}
});