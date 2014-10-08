jQuery.sap.declare("sap.m.sample.ListUnread.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ListUnread.Component", {

	metadata : {
		rootView : "sap.m.sample.ListUnread.List",
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
					"List.controller.js",
					"Formatter.js"
				]
			}
		}
	}
});