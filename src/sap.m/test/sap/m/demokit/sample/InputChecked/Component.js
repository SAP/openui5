jQuery.sap.declare("sap.m.sample.InputChecked.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.InputChecked.Component", {

	metadata : {
		rootView : "sap.m.sample.InputChecked.V",
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