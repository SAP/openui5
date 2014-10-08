jQuery.sap.declare("sap.m.sample.DisplayListItem.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.DisplayListItem.Component", {

	metadata : {
		rootView : "sap.m.sample.DisplayListItem.List",
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