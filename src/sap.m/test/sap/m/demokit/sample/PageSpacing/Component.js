jQuery.sap.declare("sap.m.sample.PageSpacing.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.PageSpacing.Component", {

	metadata : {
		rootView : "sap.m.sample.PageSpacing.Page",
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