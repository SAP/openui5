jQuery.sap.declare("sap.m.sample.ObjectHeaderResponsiveVI.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectHeaderResponsiveVI.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectHeaderResponsiveVI.Page",
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