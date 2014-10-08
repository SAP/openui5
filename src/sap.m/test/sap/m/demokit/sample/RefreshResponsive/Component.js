jQuery.sap.declare("sap.m.sample.RefreshResponsive.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.RefreshResponsive.Component", {

	metadata : {
		rootView : "sap.m.sample.RefreshResponsive.Page",
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