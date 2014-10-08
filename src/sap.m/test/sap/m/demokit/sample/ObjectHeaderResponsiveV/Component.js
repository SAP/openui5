jQuery.sap.declare("sap.m.sample.ObjectHeaderResponsiveV.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectHeaderResponsiveV.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectHeaderResponsiveV.Page",
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