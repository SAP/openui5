jQuery.sap.declare("sap.m.sample.ActionSelect.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ActionSelect.Component", {

	metadata : {
		rootView : "sap.m.sample.ActionSelect.V",
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