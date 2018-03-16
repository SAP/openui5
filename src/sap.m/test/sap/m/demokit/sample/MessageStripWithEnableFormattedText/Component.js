jQuery.sap.declare("sap.m.sample.MessageStripWithEnableFormattedText.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MessageStripWithEnableFormattedText.Component", {

	metadata : {
		rootView : {
			"viewName": "sap.m.sample.MessageStripWithEnableFormattedText.V",
			"type": "XML",
			"async": true
		},
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
