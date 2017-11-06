jQuery.sap.declare("sap.m.sample.TimePicker.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TimePicker.Component", {

	metadata : {
		rootView : {
			"viewName": "sap.m.sample.TimePicker.TimePicker",
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
				files : [
					"TimePicker.view.xml",
					"TimePicker.controller.js"
				]
			}
		}
	}
});
