jQuery.sap.declare("sap.m.sample.StandardListItem.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.StandardListItem.Component", {

	metadata : {
		rootView : "sap.m.sample.StandardListItem.List",
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