jQuery.sap.declare("sap.m.sample.OverflowToolbarFooter.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.OverflowToolbarFooter.Component", {

	metadata : {
		rootView : "sap.m.sample.OverflowToolbarFooter.OverflowToolbar",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"OverflowToolbar.view.xml",
					"OverflowToolbar.controller.js"
				]
			}
		}
	}
});