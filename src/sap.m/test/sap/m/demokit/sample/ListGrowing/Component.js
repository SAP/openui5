jQuery.sap.declare("sap.m.sample.ListGrowing.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ListGrowing.Component", {

	metadata : {
		rootView : "sap.m.sample.ListGrowing.List",
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