jQuery.sap.declare("sap.m.sample.Token.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Token.Component", {

	metadata : {
		rootView : "sap.m.sample.Token.Page",
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