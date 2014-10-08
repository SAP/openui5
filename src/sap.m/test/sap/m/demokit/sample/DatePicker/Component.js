jQuery.sap.declare("sap.m.sample.DatePicker.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.DatePicker.Component", {

	metadata : {
		rootView : "sap.m.sample.DatePicker.Group",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout",
				"sap.ui.unified"
			]
		},
		config : {
			sample : {
				files : [
					"Group.view.xml",
					"Group.controller.js"
				]
			}
		}
	}
});