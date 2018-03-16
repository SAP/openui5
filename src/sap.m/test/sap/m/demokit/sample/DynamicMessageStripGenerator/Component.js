jQuery.sap.declare("sap.m.sample.DynamicMessageStripGenerator.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.DynamicMessageStripGenerator.Component", {

	metadata : {
		rootView : {
			"viewName": "sap.m.sample.DynamicMessageStripGenerator.V",
			"type": "XML",
			"async": true
		},
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"V.view.xml",
					"C.controller.js"
				]
			}
		}
	}
});