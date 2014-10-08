jQuery.sap.declare("sap.m.sample.ListItemTypes.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ListItemTypes.Component", {

	metadata : {
		rootView : "sap.m.sample.ListItemTypes.List",
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