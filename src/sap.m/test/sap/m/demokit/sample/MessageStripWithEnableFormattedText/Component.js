jQuery.sap.declare("sap.m.sample.MessageStripWithEnableFormattedText.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MessageStripWithEnableFormattedText.Component", {

	metadata : {
		rootView : "sap.m.sample.MessageStripWithEnableFormattedText.V",
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
