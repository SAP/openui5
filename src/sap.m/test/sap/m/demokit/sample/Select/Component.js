jQuery.sap.declare("sap.m.sample.Select.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Select.Component", {

	metadata : {
		rootView : "sap.m.sample.Select.Page",
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