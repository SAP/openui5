jQuery.sap.declare("sap.m.sample.ListSwipe.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ListSwipe.Component", {

	metadata : {
		rootView : "sap.m.sample.ListSwipe.List",
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