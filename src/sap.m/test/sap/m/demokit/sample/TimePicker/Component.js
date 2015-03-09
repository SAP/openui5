jQuery.sap.declare("sap.m.sample.TimePicker.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TimePicker.Component", {

	metadata : {
		rootView : "sap.m.sample.TimePicker.TimePicker",
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
