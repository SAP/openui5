jQuery.sap.declare("sap.m.sample.StandardListItemInfo.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.StandardListItemInfo.Component", {

	metadata : {
		rootView : "sap.m.sample.StandardListItemInfo.List",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				files : [
					"List.view.xml",
					"List.controller.js",
					"Formatter.js"
				]
			}
		}
	}
});