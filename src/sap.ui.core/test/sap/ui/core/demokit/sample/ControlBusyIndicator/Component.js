jQuery.sap.declare("sap.ui.core.sample.ControlBusyIndicator.Component");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.ControlBusyIndicator.Component", {

	metadata : {
		rootView : "sap.ui.core.sample.ControlBusyIndicator.Page",
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
				]
			}
		}
	}
});