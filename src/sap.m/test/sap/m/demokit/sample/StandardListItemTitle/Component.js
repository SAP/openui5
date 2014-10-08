jQuery.sap.declare("sap.m.sample.StandardListItemTitle.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.StandardListItemTitle.Component", {

	metadata : {
		rootView : "sap.m.sample.StandardListItemTitle.List",
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