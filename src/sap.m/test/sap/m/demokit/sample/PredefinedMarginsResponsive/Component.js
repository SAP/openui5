jQuery.sap.declare("sap.m.sample.PredefinedMarginsResponsive.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.PredefinedMarginsResponsive.Component", {

	metadata : {
		rootView : "sap.m.sample.PredefinedMarginsResponsive.Page",
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