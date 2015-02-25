jQuery.sap.declare("sap.m.sample.OverflowToolbarSimple.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.OverflowToolbarSimple.Component", {

	metadata : {
		rootView : "sap.m.sample.OverflowToolbarSimple.OverflowToolbar",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				files : [
					"OverflowToolbar.view.xml",
					"OverflowToolbar.controller.js"
				]
			}
		}
	}
});