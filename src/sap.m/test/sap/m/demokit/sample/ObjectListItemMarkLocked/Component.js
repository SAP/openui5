jQuery.sap.declare("sap.m.sample.ObjectListItemMarkLocked.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectListItemMarkLocked.Component", {
	metadata : {
		rootView : "sap.m.sample.ObjectListItemMarkLocked.List",
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
