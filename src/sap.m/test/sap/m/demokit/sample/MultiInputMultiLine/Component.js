jQuery.sap.declare("sap.m.sample.MultiInputMultiLine.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MultiInputMultiLine.Component", {

	metadata : {
		rootView : "sap.m.sample.MultiInputMultiLine.Page",
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