jQuery.sap.declare("sap.m.sample.Button.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Button.Component", {

	metadata : {
		rootView : "sap.m.sample.Button.Page",
		dependencies : {
			libs : [
				"sap.m"
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