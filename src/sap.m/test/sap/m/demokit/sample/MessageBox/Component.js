jQuery.sap.declare("sap.m.sample.MessageBox.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MessageBox.Component", {

	metadata : {
		rootView : "sap.m.sample.MessageBox.V",
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