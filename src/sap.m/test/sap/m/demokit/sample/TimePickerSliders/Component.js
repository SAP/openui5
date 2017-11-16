jQuery.sap.declare("sap.m.sample.TimePickerSliders.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TimePickerSliders.Component", {

	metadata : {
		rootView : {
			"viewName": "sap.m.sample.TimePickerSliders.TimePickerSliders",
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
					"TimePickerSliders.view.xml",
					"TimePickerSlidersDialog.fragment.xml",
					"TimePickerSliders.controller.js"
				]
			}
		}
	}
});
