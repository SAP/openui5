jQuery.sap.declare("sap.m.sample.OverflowToolbarButton.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.OverflowToolbarButton.Component", {

	metadata : {
		rootView : "sap.m.sample.OverflowToolbarButton.OverflowToolbarButton",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				files : [
					"OverflowToolbarButton.view.xml",
					"OverflowToolbarButton.controller.js"
				]
			}
		}
	}
});