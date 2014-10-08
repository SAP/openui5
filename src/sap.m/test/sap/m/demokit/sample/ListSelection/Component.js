jQuery.sap.declare("sap.m.sample.ListSelection.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ListSelection.Component", {

	metadata : {
		rootView : "sap.m.sample.ListSelection.List",
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