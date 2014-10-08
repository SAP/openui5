jQuery.sap.declare("sap.m.sample.ListToolbar.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ListToolbar.Component", {

	metadata : {
		rootView : "sap.m.sample.ListToolbar.List",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"List.view.xml",
					"List.controller.js"
				]
			}
		}
	}
});