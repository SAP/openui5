jQuery.sap.declare("sap.m.sample.CustomListItem.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.CustomListItem.Component", {

	metadata : {
		rootView : "sap.m.sample.CustomListItem.List",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		includes : [ "CustomListItem/style.css" ],
		config : {
			sample : {
				files : [
					"style.css",
					"List.view.xml"
				]
			}
		}
	}
});