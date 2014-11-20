jQuery.sap.declare("sap.m.sample.PredefinedMarginsEnforceWidthAuto.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.PredefinedMarginsEnforceWidthAuto.Component", {

	metadata : {
		rootView : "sap.m.sample.PredefinedMarginsEnforceWidthAuto.Page",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
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