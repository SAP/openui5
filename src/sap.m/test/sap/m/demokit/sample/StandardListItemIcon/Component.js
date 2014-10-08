jQuery.sap.declare("sap.m.sample.StandardListItemIcon.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.StandardListItemIcon.Component", {

	metadata : {
		rootView : "sap.m.sample.StandardListItemIcon.List",
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