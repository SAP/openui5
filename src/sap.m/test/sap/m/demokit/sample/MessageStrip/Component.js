jQuery.sap.declare("sap.m.sample.MessageStrip.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MessageStrip.Component", {

	metadata : {
		rootView : {
			"viewName": "sap.m.sample.MessageStrip.V",
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
					"V.view.xml"
				]
			}
		}
	}
});
