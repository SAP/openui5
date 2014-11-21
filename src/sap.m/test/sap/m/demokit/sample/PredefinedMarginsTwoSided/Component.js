jQuery.sap.declare("sap.m.sample.PredefinedMarginsTwoSided.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.PredefinedMarginsTwoSided.Component", {

	metadata : {
		rootView : "sap.m.sample.PredefinedMarginsTwoSided.Page",
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