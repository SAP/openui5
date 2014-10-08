jQuery.sap.declare("sap.m.sample.StandardListItemDescription.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.StandardListItemDescription.Component", {

	metadata : {
		rootView : "sap.m.sample.StandardListItemDescription.List",
		dependencies : {
			libs : [
				"sap.m"
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