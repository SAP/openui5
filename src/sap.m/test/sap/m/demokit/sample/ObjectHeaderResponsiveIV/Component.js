jQuery.sap.declare("sap.m.sample.ObjectHeaderResponsiveIV.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectHeaderResponsiveIV.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectHeaderResponsiveIV.Page",
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