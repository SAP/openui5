jQuery.sap.declare("sap.m.sample.MultiInput.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MultiInput.Component", {

	metadata : {
		rootView : "sap.m.sample.MultiInput.Page",
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