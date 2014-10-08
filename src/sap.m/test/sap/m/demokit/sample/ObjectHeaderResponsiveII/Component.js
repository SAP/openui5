jQuery.sap.declare("sap.m.sample.ObjectHeaderResponsiveII.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectHeaderResponsiveII.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectHeaderResponsiveII.Page",
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