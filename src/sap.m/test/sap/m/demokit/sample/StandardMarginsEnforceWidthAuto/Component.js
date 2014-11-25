jQuery.sap.declare("sap.m.sample.StandardMarginsEnforceWidthAuto.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.StandardMarginsEnforceWidthAuto.Component", {

	metadata : {
		rootView : "sap.m.sample.StandardMarginsEnforceWidthAuto.Page",
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