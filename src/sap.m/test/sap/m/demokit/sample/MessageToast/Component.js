jQuery.sap.declare("sap.m.sample.MessageToast.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MessageToast.Component", {

	metadata : {
		rootView : "sap.m.sample.MessageToast.V",
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
					"C.controller.js"
				]
			}
		}
	}
});