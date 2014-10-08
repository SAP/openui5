jQuery.sap.declare("sap.m.sample.ObjectHeaderResponsiveI.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectHeaderResponsiveI.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectHeaderResponsiveI.Page",
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