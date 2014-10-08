jQuery.sap.declare("sap.m.sample.ToggleButton.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ToggleButton.Component", {

	metadata : {
		rootView : "sap.m.sample.ToggleButton.Page",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"Page.view.xml",
					"Page.controller.js"
				],
			}
		}
	}
});