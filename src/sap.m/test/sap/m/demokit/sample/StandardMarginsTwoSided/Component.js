jQuery.sap.declare("sap.m.sample.StandardMarginsTwoSided.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.StandardMarginsTwoSided.Component", {

	metadata : {
		rootView : "sap.m.sample.StandardMarginsTwoSided.Page",
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